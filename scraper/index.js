const puppeteer = require('puppeteer-core');
const config = require('./config.json');
const { getQuitFn, getPuppArgs, sleep, loadSession, saveSession } = require('./utils');
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
  // for (let idx = 0; idx < config.urls.length; idx++) {
  const idx = 0;
  const url = config.urls[idx];
  await page.goto(url);
  const sessionLoaded = await loadSession(page);
  if (sessionLoaded) await page.reload();

  let sel;
  let ret;
  try {
    sel = 'button[title="Allow essential and optional cookies"]';
    ret = await page.waitForSelector(sel, { timeout: 2000 });
    await page.click(sel);
  } catch {
    console.log('cookie button not found or already clicked?');
  }
  console.log('2>>>', 'focus?');
  await sleep(5000);
  await page.focus('input#email');
  await page.keyboard.type(config.fbUsername);
  await page.focus('input#pass');
  await page.keyboard.type(config.fbPassword);
  await page.click('button#loginbutton');
  await sleep(5000);
  await saveSession(page);
  // $$('input#email')
  // $$('input#pass')
  await sleep(5000);
  // }
})();
