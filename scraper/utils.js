const fs = require('fs');
const chalk = require('chalk');
const config = require('./config.json');

const getQuitFn = (pup = { browser: null, page: null }) => {
  return async function quit(code = 0, message = '') {
    if (message) print(!code ? message : chalk.red(message));
    await saveSession(pup.page);
    await pup.browser.close();
    process.exit(code);
  };
};

const getPuppArgs = (extras = []) =>
  [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-crash-reporter',
    `--user-agent="${config.userAgent}"`,
    '--use-gl=egl',
    '--password-store=basic',
    '--use-mock-keychain',
    '--disable-notifications',
    '--lang=en-US,en',
    ...extras,
  ].filter((x) => x);

function sleep(sec, location = '') {
  const prefix = location ? ` (at ${location})` : '';
  log.info(`Waiting for ${sec} second(s)${prefix}...`);
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

async function saveSession(page, showStopper = true) {
  log.info('Saving the session...');
  try {
    let cookies = await page.cookies();
    cookies = JSON.stringify(cookies);
    const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
    const localStorage = await page.evaluate(() => JSON.stringify(localStorage));
    const data = JSON.stringify({ cookies, sessionStorage, localStorage }, null, 2);
    fs.writeFileSync('scraper/session.json', data, 'utf-8');
    log.success('Session saved as "session.json".');
  } catch {
    log.error('Could not save the browser session.');
    if (showStopper) await handleShowStopperError();
  }
}

async function loadSession(page, showStopper = true) {
  if (!fs.existsSync('scraper/session.json')) return false;
  try {
    const session = JSON.parse(fs.readFileSync('scraper/session.json', 'utf-8'));
    const cookies = JSON.parse(session.cookies);
    const sessionStorage = JSON.parse(session.sessionStorage);
    const localStorage = JSON.parse(session.localStorage);
    await page.setCookie(...cookies);
    await page.evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        sessionStorage[key] = value;
      }
    }, sessionStorage);
    await page.evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage[key] = value;
      }
    }, sessionStorage);
    return true;
  } catch {
    log.error('Could not restore the browser session.');
    if (showStopper) await handleShowStopperError();
  }
}

const log = {
  error: (msg, err) => console.log(chalk.red(msg), err ? '\n' + err : ''),
  die: async (msg, timeout = 60 * 5) => {
    console.log(chalk.red(msg));
    console.log(chalk.red(`You have ${timeout / 60000} minutes to debug, after that this script will exit.`));
    await sleep(timeout);
    process.exit(1);
  },
  info: (msg) => console.log(msg),
  success: (msg) => console.log(chalk.cyan(msg)),
  warning: (msg) => console.log(chalk.yellow(msg)),
};

async function handleShowStopperError(msg) {
  const prefix = msg ? `${msg}\n` : '';
  log.error(prefix + 'This is a showstopper error, you have 10 minutes to debug, then the process will exit.');
  await sleep(1000 * 60 * 10);
  process.exit(2);
}

async function getClassNames(page, selector, showStopper = true) {
  try {
    const el = await page.$(selector);
    const className = await (await el.getProperty('className')).jsonValue();
    return className.replace(/\s+/, ' ').split(' ');
  } catch {
    if (showStopper) await handleShowStopperError(`Could not get the classnames for element "${selector}"!`);
  }
}

async function hasClassName(page, selector, className, showStopper = true) {
  const classes = await getClassNames(page, selector, showStopper);
  return classes.includes(className);
}

async function fillInput(page, selector, value, showStopper = true) {
  log.info(`Trying to fill input field "${selector}"...`);
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    await page.focus(selector);
    await page.keyboard.type(value);
  } catch {
    log.error(`Could not fill input field "${selector}"!`);
    if (showStopper) await handleShowStopperError();
  }
}

async function submitForm(page, selector, showStopper = true) {
  log.info(`Clicking submit button "${selector}"`);
  try {
    await page.click(selector);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
  } catch {
    log.error(`Could not submit a form by clicking the button "${selector}"!`);
    if (showStopper) await handleShowStopperError();
  }
}

async function clickElement(page, selector, showStopper = true) {
  try {
    await page.waitForSelector(selector, { timeout: 4000 });
    await page.click(selector);
  } catch {
    log.error(`Could not click on the element "${selector}"!`);
    if (showStopper) await handleShowStopperError();
  }
}

async function openPage(page, url, showStopper = true) {
  log.info(`Opening the page "${url}".`);
  try {
    await page.goto(url);
    await page.goto(url, { waitUntil: 'networkidle0' });
    return true;
  } catch (err) {
    log.error(`Could not open the page ("${url}")!`, err);
    if (showStopper) await handleShowStopperError();
  }
  return false;
}

async function scrollToPageBottom(page, count = 1) {
  log.info(`Scrolling to the bottom of the page ${count} times...`);
  for (let inIdx = 0; inIdx < count; inIdx++) {
    await page.evaluate(() => window.scrollTo(0, window.document.body.scrollHeight)); // sending keyboard End did not work
    await sleep(2);
  }
}

async function openPageAndRestoreSession(page, url, showStopper = true) {
  log.info(`Opening the page "${url}" and restoring the session.`);
  try {
    await page.goto(url);
    const sessionLoaded = await loadSession(page);
    if (sessionLoaded) await page.reload();
    await sleep(5, 'openPageAndRestoreSession');
  } catch (err) {
    log.error(`Could not open the page ("${url}") and restore the session!`, err);
    if (showStopper) await handleShowStopperError();
  }
}

const fb = {
  findEventUrls: async (page) => {
    log.info(`Collecting facebook event urls on the page...`);
    let eventUrls = [];
    try {
      eventUrls = await page.$$eval(`a[href^="https://www.facebook.com/events/"][role="link"]`, (els) =>
        els.map((el) => {
          if (!(el.innerText || el.textContent).trim()) return null;
          return el.getAttribute('href');
        })
      );
    } catch (err) {
      log.error('There was a problem with finding the facebook event urls.', err);
      return [];
    }
    eventUrls = (eventUrls || []).filter((url) => url);
    log.info(`Found ${eventUrls.length} item(s).`);
    return eventUrls;
  },
  isStringFbUrl: (url) => {
    const state = url.toLowerCase().startsWith('https://www.facebook.com');
    log.info(`The url "${url}" is ${state ? '' : 'NOT '}a facebook url.`);
    return state;
  },
  isLoginPage: (page) => {
    const url = String(page.url());
    const state = url.endsWith('/login');
    log.info(`This is ${state ? '' : 'NOT '}the login page (from the url "${url}").`);
    return state;
  },
  isHomePage: (page) => {
    const url = String(page.url());
    const currentUrl = url.replace(/\.php$/, '');
    const state = currentUrl.endsWith('/home') || currentUrl.endsWith('facebook.com/');
    log.info(`This is ${state ? '' : 'NOT '}the home page (from the url "${url}").`);
    return state;
  },
};

const scraper = {
  fb,
  openPage,
  openPageAndRestoreSession,
  scrollToPageBottom,
  getClassNames,
  hasClassName,
  fillInput,
  submitForm,
  clickElement,
  saveSession,
  loadSession,
};

module.exports = {
  scraper,
  log,
  getQuitFn,
  getPuppArgs,
  sleep,
};
