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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveSession(page) {
  let cookies = await page.cookies();
  cookies = JSON.stringify(cookies);
  const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
  const localStorage = await page.evaluate(() => JSON.stringify(localStorage));
  fs.writeFileSync('scraper/session.json', JSON.stringify({ cookies, sessionStorage, localStorage }, null, 2), 'utf-8');
  log.success('Session saved as "session.json".');
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

const log = {
  error: (msg) => console.log(chalk.red(msg)),
  die: async (msg, timeout = 60000 * 5) => {
    console.log(chalk.red(msg));
    console.log(chalk.red(`You have ${timeout / 60000} minutes to debug, after that this script will exit.`));
    await sleep(timeout);
    process.exit(1);
  },
  info: (msg) => console.log(msg),
  success: (msg) => console.log(chalk.cyan(msg)),
  warning: (msg) => console.log(chalk.yellow(msg)),
};

/** Go up until a callback evals to true. Max 10 steps. */
// function goUpCallback(firstEl, cb) {
//   const max = 10;
//   let el = firstEl;
//   for (let idx = 0; idx < max; idx++) {
//     const text = el.innerText.trim();
//     if (el && cb(text, idx) === true) return true;
//     el = el.parentNode;
//   }
//   return false;
// }

// const dom = { goUpCallback };

module.exports = {
  log,
  getQuitFn,
  getPuppArgs,
  sleep,
  saveSession,
  loadSession,
};
