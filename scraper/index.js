const puppeteer = require('puppeteer-core');
const config = require('./config.json');
const { getQuitFn, getPuppArgs, sleep, loadSession, saveSession, log } = require('./utils');
const extractUrlId = require('../scripts/utils/string/extractUrlId');

(async () => {
  const pup = { browser: null, page: null };
  const quit = getQuitFn(pup);
  async function handleExit() {
    console.log('1>>>');
    await quit(0, 'Closing chrome, good bye!');
  }
  process.on('SIGINT', handleExit);

  const browser = (pup.browser = await puppeteer.launch({
    headless: false,
    executablePath: config.browserPath,
    args: getPuppArgs(),
  }));
  const page = (pup.page = await browser.newPage());

  // open login (fb may redirect us after the session restore)
  let url = 'https://www.facebook.com/login';
  let sel;
  let currentUrl;
  await page.goto(url);
  const sessionLoaded = await loadSession(page);
  if (sessionLoaded) await page.reload();

  // cookie consent
  log.info('Waiting 2s, then will check for cookie consent.');
  await sleep(2000);
  try {
    sel = 'button[title="Allow essential and optional cookies"]';
    await page.waitForSelector(sel, { timeout: 2000 });
    await page.click(sel);
  } catch {
    log.info('Could not click on the cookie consent, hopefully it has already been accepted');
  }

  // wait for redirect (if session is okay, then it will autologin us)
  log.info('Maybe fb will redirect or have redirected, waiting 1s...');
  await sleep(1000);
  const isLoginPage = String(page.url()).endsWith('/login');
  log.info('Checking url: ' + (isLoginPage ? 'this is the login page.' : 'this is NOT the login page.'));

  // login still needed
  if (isLoginPage) {
    log.info('We need to log in.');
    try {
      log.info('Waiting for "input#email" and "input#pass", max 2s...');
      await page.waitForSelector('input#email', { timeout: 2000 });
      await page.focus('input#email');
      await page.keyboard.type(config.fbUsername);
      await page.waitForSelector('input#pass', { timeout: 2000 });
      await page.focus('input#pass');
      await page.keyboard.type(config.fbPassword);
      log.info('Clicking on the submit button and then will wait for network idle (and then will save the session)...');
      await page.click('button#loginbutton');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch {
      await log.die('Login form fileds not found!');
    }
  }

  // check if we have been redirected to the homep age?
  currentUrl = String(page.url()).replace(/\.php$/, '');
  if (currentUrl.endsWith('/home') || currentUrl.endsWith('facebook.com/')) {
    log.success('This is the home page, as expected. Saving session.');
    await saveSession(page);
  } else {
    log.die('We are not on the homepage or the page loads too slowly?');
  }

  // the main loop
  log.info('Now we can start parsing the urls...');
  for (let idx = 0; idx < config.urls.length; idx++) {
    url = config.urls[idx];
    if (!url.startsWith('https://www.facebook.com')) {
      log.info(`Skipping url: ${url}`);
      continue;
    }
    const urlId = extractUrlId(url);
    log.info(`Opening the url "${url}" (slug/id: ${urlId})...`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // scroll to bottom of the page multiple times
    log.info('Force lazy load to download some events (jumping to the end of the page)...');
    const lazyBottomCount = 3;
    for (let inIdx = 0; inIdx < lazyBottomCount; inIdx++) {
      await page.evaluate(() => window.scrollTo(0, window.document.body.scrollHeight)); // sending keyboard End did not work
      await sleep(2000);
    }
    log.info('Waiting for 5s bit so that the events can load...');
    await sleep(3000);

    // parsing the small cards
    const eventLinkOnCardStartsWith = 'https://www.facebook.com/events/';
    let eventList =
      (await page.$$eval(`a[href^="${eventLinkOnCardStartsWith}"][role="link"]`, (els) =>
        els.map((linkEl) => {
          let el = linkEl;
          const title = (el.innerText || el.textContent).trim();
          const eventUrl = el.getAttribute('href');
          let date = '';
          const maxUp = 10;
          let found = false;
          let text = '';
          // we go up until we have something that resembles the last line of a card ('Event by')
          // (we're inside the page's eval context!)
          for (let i = 0; i < maxUp; i++) {
            text = el.innerText.trim();
            found = text.toLocaleLowerCase().includes('event by ');
            if (found) break;
            el = el.parentNode;
          }
          if (!found) return null;
          date = text.split('\n')[0];
          return { title, eventUrl, date };
        })
      )) || [];
    console.info(eventList);
  }

  await sleep(5000);
})();
