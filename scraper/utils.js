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
    ...extras,
  ].filter((x) => x);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveSession(page) {
  let cookies = await page.cookies();
  cookies = JSON.stringify(cookies);
  const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
  const localStorage = await page.evaluate(() => JSON.stringify(localStorage));
  fs.writeFileSync('scraper/session.json', JSON.stringify({ cookies, sessionStorage, localStorage }, null, 2), 'utf-8');
}

async function loadSession(page) {
  if (!fs.existsSync('scraper/session.json')) return false;
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
}

module.exports = {
  getQuitFn,
  getPuppArgs,
  sleep,
  saveSession,
  loadSession,
};
