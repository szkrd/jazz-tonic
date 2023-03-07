const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const shelljs = require('shelljs');
const dayjs = require('dayjs');
require('dayjs/locale/hu');
const { minify } = require('html-minifier-terser');
const log = require('../../parser/modules/log');
const config = require('./config');
const templater = require('./templater');

const { outDir } = config;
const templatesDir = './templates';

module.exports = function processMainJson(mainJson) {
  const baseDate = config.useFakeDate ? config.fakeDate : dayjs().format('YYYY-MM-DD');
  log.info(`Using ${config.useFakeDate ? 'FAKE ' : 'current '}base date "${chalk.greenBright(baseDate)}"`);

  // save per event static js data
  const dataUri = `/data-${baseDate}`;
  const currentDataDir = path.join(outDir, dataUri);
  if (!fs.existsSync(currentDataDir)) shelljs.mkdir(currentDataDir);
  mainJson.dataDir = dataUri;

  // add hasEvents to root
  mainJson.hasEvents = mainJson.events.length > 0;

  // add release id and file hashes for cache busting
  mainJson.releaseId = Date.now();
  mainJson.buildDate = dayjs().format('YYYY-MM-DDTHH:mm:ss'); // local date
  mainJson.buildBy = process.env.username || process.env.USER || 'unknown';

  // global metadata (already stringified)
  mainJson.meta = JSON.stringify({
    releaseId: mainJson.releaseId,
    build: { date: mainJson.buildDate, user: mainJson.buildBy },
  });

  // create lodash template from the modal window so that we can save it as an html as well
  const subPageText = fs.readFileSync(path.join(templatesDir, 'modal.tpl'), 'utf-8');

  mainJson.events.forEach((event) => {
    // add event.active to valid events (ones that are in range)
    let dateTime = event.date;
    if (event.startTime) dateTime += 'T' + event.startTime;
    event.active = dayjs(dateTime).isBefore(dayjs(baseDate).add(...config.maximumDateRange));
    event.hidden = !event.active;

    // add startDateTime, startDateTimeNumber and formattedDate
    event.startDateTime = dateTime;
    event.startDateTimeNumber = dayjs(dateTime).toDate() * 1;
    event.startDateTimeFormatted = dayjs(dateTime).locale('hu').format(config.eventDateFormat);

    // fix broken (?) dates where we have no start time at all
    if ((dateTime || '').match(/^\d{4}-\d{2}-\d{2}$/)) {
      event.startDateTimeFormatted = dayjs(dateTime).locale('hu').format(config.eventDateNoTimeFormat);
    }

    delete event.description; // we need only the descriptionHtml!

    // add relative data location (where the current event's js will be saved)
    event.dataUri = `${dataUri}/event-${event.rowIdx}.js?r=${mainJson.releaseId}`.replace(/^\//, '');
    event.dataUriForHtml = event.dataUri.replace(/\.js.*/, '.html');
    const eventDataFileName = path.join(currentDataDir, `/event-${event.rowIdx}`);
    fs.promises.writeFile(eventDataFileName + '.js', 'window.pv.addEvent(' + JSON.stringify(event) + ')', 'utf-8');

    // we always minify the modal, it's kinda messy without that,
    // but the whitespace collapse would make it much harder to debug that
    const htmlOutput = templater.render(subPageText, { ...event, subPage: true });
    const minifierOptions = { collapseWhitespace: config.minifyHtml };
    minify(htmlOutput, minifierOptions).then((text) =>
      fs.promises.writeFile(eventDataFileName + '.html', text, 'utf-8')
    );
  });

  // keep only the active items for the template for now
  mainJson.events = mainJson.events.filter((event) => event.active);

  // last minute sort
  mainJson.events = _.sortBy(mainJson.events, ['startDateTimeNumber']);
};
