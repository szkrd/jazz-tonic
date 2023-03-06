const dayjs = require('dayjs');
const { uniq } = require('lodash');
const puppeteer = require('puppeteer-core');
const { getQuitFn, getPuppArgs, log, config } = require('../facebook/utils');
const { getScraper } = require('./utils');

async function main() {
  const pup = { browser: null, page: null };
  const quit = getQuitFn(pup);
  async function handleExit() {
    await quit(0, 'Closing chrome, good bye!');
  }
  process.on('SIGINT', handleExit);

  const browser = (pup.browser = await puppeteer.launch({
    headless: false,
    executablePath: config.browserPath,
    args: getPuppArgs(),
  }));
  const page = (pup.page = await browser.newPage());
  const scraper = getScraper(page);

  // await page.goto('https://m.mupa.hu/programnaptar');
  const from = dayjs().format('YYYY-MM-DD');
  const to = dayjs().add(2, 'months').format('YYYY-MM-DD');
  await page.goto(`https://m.mupa.hu/programok/lista?tol=${from}&ig=${to}`);

  // await scraper.removeElementBySelector('.cookie-alert');

  // await scraper.clickOnText('.menu a > span', 'Programnaptár');

  await page.waitForSelector('.events');

  const events = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.additional time'));
    const uniqueEvents = [];
    const ret = [];
    els.forEach((el) => {
      const eventEl = el.closest('div.event');
      const containerEl = el.closest('.description');
      const timeEl = containerEl.querySelector('time');
      const event = {
        url: eventEl.querySelector('a')?.href,
        startDate: timeEl?.getAttribute('datetime').trim(),
        startTime: timeEl?.innerText.trim(),
        performer: containerEl.querySelector('h2')?.innerText.trim(),
        place: containerEl.querySelector('.location')?.innerText.trim(),
      };
      // sometimes they upload the same event to multiple "places", though it's quite rare
      const uid = event.startDate + event.startTime + event.performer;
      if (uniqueEvents.includes(uid)) return;
      uniqueEvents.push(uid);
      ret.push(event);
    });
    return ret;
  });
  console.log('Number of events: ', events.length);
  const perfUniq = uniq(events.map((event) => event.performer));
  console.log('Number of unique performers:', perfUniq.length);
}

main().catch((err) => {
  log.error(err);
});
