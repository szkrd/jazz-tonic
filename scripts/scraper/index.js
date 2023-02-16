const puppeteer = require('puppeteer-core');
const config = require('./config.json');
const { getQuitFn, getPuppArgs, log, scraper } = require('./utils');

(async () => {
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

  // open login (fb may redirect us after the session restore)
  await scraper.openPageAndRestoreSession(page, 'https://www.facebook.com/login');

  const cookieCoverActive = await scraper.hasClassName(page, 'body', 'hasCookieBanner');
  if (cookieCoverActive) {
    await scraper.clickElement(page, 'button[title="Allow essential and optional cookies"]');
  }

  if (scraper.fb.isLoginPage(page)) {
    await scraper.fillInput(page, 'input#email', config.fbUsername);
    await scraper.fillInput(page, 'input#pass', config.fbPassword);
    await scraper.submitForm(page, 'button#loginbutton');
  }

  if (scraper.fb.isHomePage(page)) {
    await scraper.saveSession(page);
  }

  // the main loop
  let eventUrls = [];
  log.info('Now we can start parsing the urls...');
  for (let idx = 0; idx < config.urls.length; idx++) {
    let url = config.urls[idx];
    if (!scraper.fb.isStringFbUrl(url)) continue;

    const urlOpened = await scraper.openPage(page, url, false);
    if (!urlOpened) continue;

    await scraper.scrollToPageBottom(page, 2);
    eventUrls = await scraper.fb.findEventUrls(page);
  }
  log.info(`Event urls:\n${eventUrls.join('\n')}`);
  log.info('Done.\nYou can exit with "ctrl+c"!');

  // There are numerous problems with the commented out code (and with what we're doing):
  // 1. it's not enough to find the event urls on the card page, but we will need to
  //    get into the event page itself, because fb tends to shorten/hide/remove info inside the card
  // 2. since the date in the card is shortened (in a destructive way, meaning it may or may not
  //    hold the proper start and end date with hours), we need the date from the details page
  // 3. only the url can be found semantically, so either we use the MINIFIED css classnames
  //    for closest parent or we go up until the (grand-grand)parent's content "looks like" an event card
  // 4. facebook has multiple different events page layout (!!), the newer ones show the cards
  //    in a grid (with on demand infinite loading), the older ones show them as
  //    a vertical list (with "show more" button)
  // 5. when parsing the event page, we would need a per-venue based filter/parser,
  //    so that we could avoid pulling down unneeded events (like things that are far away in the future,
  //    or events with a title that indicates that the tickets were SOLD OUT"), which is
  //    complicated and brittle (and probably would need to be adapted to event naming patterns
  //    of an unknown individual, who administers the venue's event page)

  // -----------------------------------------------------------------------------------------------
  //   const urlId = extractUrlId(url);
  //   log.info(`Opening the url "${url}" (slug/id: ${urlId})...`);
  //   await page.goto(url, { waitUntil: 'networkidle0' });
  //   // scroll to bottom of the page multiple times
  //   log.info('Force lazy load to download some events (jumping to the end of the page)...');
  //   const lazyBottomCount = MAX_SHOW_MORE_SCROLL;
  //   for (let inIdx = 0; inIdx < lazyBottomCount; inIdx++) {
  //     await page.evaluate(() => window.scrollTo(0, window.document.body.scrollHeight)); // sending keyboard End did not work
  //     await sleep(2);
  //   }
  //   log.info('Waiting for 5s bit so that the events can load...');
  //   await sleep(3);
  //   // parsing the small cards
  //   const eventLinkOnCardStartsWith = 'https://www.facebook.com/events/';
  //   const parseAtDate = dayjs().format('YYYY-MM-DD');
  //   let eventList =
  //     (await page.$$eval(`a[href^="${eventLinkOnCardStartsWith}"][role="link"]`, (els) =>
  //       els.map((linkEl) => {
  //         let el = linkEl;
  //         const title = (el.innerText || el.textContent).trim();
  //         if (!title) return null;
  //         const eventUrl = el.getAttribute('href');
  //         let date = '';
  //         const maxUp = 10;
  //         let found = false;
  //         let text = '';
  //         // we go up until we have something that resembles the last line of a card ('Event by')
  //         // (we're inside the page's eval context!)
  //         for (let i = 0; i < maxUp; i++) {
  //           text = el.innerText.trim();
  //           found = text.toLocaleLowerCase().includes('event by ');
  //           if (found) break;
  //           el = el.parentNode;
  //         }
  //         if (!found) return null;
  //         date = text.split('\n')[0];
  //         return { title, eventUrl, date };
  //       })
  //     )) || [];
  //   // cleanup the event list
  //   let ignoredEventCount = 0;
  //   eventList = eventList
  //     .filter((item) => item)
  //     .map((item) => ({ ...item, url, urlId, dateParsed: parseFbDate(item.date, parseAtDate) }))
  //     .filter((event) => {
  //       const ediff = config.maxEventDiff;
  //       const hasDate = event.dateParsed && event.dateParsed.startDate;
  //       if (!hasDate) {
  //         log.warning(`Event date parse failure:\ntitle: ${event.title}\ndate: ${event.date}\nurlId: ${event.urlId}\n`);
  //         return false;
  //       }
  //       if (hasDate && Array.isArray(ediff)) {
  //         const inRange = dayjs(event.dateParsed.startDate).isBefore(dayjs().add(...ediff));
  //         if (!inRange) ignoredEventCount++;
  //         return inRange;
  //       }
  //       return true;
  //     });
  //   console.info('Ignored event count: ' + ignoredEventCount);
  //   allEvents = allEvents.concat(eventList);
  // }
  // log.success('Saving output.json.');
  // fs.writeFileSync('scraper/output.json', JSON.stringify(allEvents, null, 2), 'utf-8');
})();
