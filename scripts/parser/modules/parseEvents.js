const path = require('path');
const fs = require('fs');
const config = require('./config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const splitGenreTags = require('../utils/string/splitGenreTags');
const log = require('./log');
const validateCellKeysOrDie = require('../utils/validation/validateCellKeysOrDie');
const normalizeEventDate = require('../utils/date/normalizeEventDate');
const removeUnknownKeys = require('../utils/object/removeUnknownKeys');
const textToHtml = require('../utils/html/textToHtml');

const COLS = [
  'rowIdx',
  'name',
  'date',
  'fbEventLink',
  'startTime',
  'endTime',
  'venue',
  'ticket',
  'description',
  'venueAddress',
  'performer',
  'genre',
  'tags',
];

module.exports = function parseEvents(eventsXlsx) {
  const fileName = path.join(config.dataDir, 'events.json');
  log.info('Parsing events...');
  const rows = xlsJsonToRows(eventsXlsx);
  const invalidTime = [];
  rows.forEach((row) => {
    validateCellKeysOrDie(row, COLS);
    removeUnknownKeys(row, COLS);

    // check start date
    if (typeof row.startDate === 'string' && row.startDate && !/^\d{2}:\d{2}$/.test(row.startDate)) {
      log.error(`Invalid startDate at ${row.rowIdx}, "${row.startDate}"!`);
      row.startDate = null;
    }

    if (row.fbEventLink && row.fbEventLink.startsWith('http') && /facebook\.com\//.test(row.fbEventLink)) {
      row.fbEventLink = row.fbEventLink.replace(/\?.*/g, ''); // truncate query params
    }

    // mark soold out
    let soldOut = 0;
    config.soldOutKeywords.forEach((keyword) => {
      soldOut += ((row.name || '').toLocaleLowerCase().match(keyword.toLocaleLowerCase()) || []).length;
    });
    row.soldOut = soldOut > 0;

    // we have a "datum" row for the original facebook date,
    // but that's relative to the crawl date, so I'm not touching it for now
    if (row.date) {
      row.date = normalizeEventDate(row.date);
    }

    // let's ignore utc offsets, we really should be parsing in our own timezone
    const timePattern = /(\d{2}:\d{2})/;
    if (row.startTime) {
      if (!timePattern.test(row.startTime)) {
        invalidTime.push({ rowIdx: row.rowIdx, startTime: row.startTime });
      } else {
        const matcher = row.startTime.match(timePattern);
        if (matcher) row.startTime = matcher[1];
      }
    }

    if (row.genre) {
      row.genre = row.genre.toLocaleLowerCase();
    }

    // create a ticketUrl for ticket
    if (typeof row.ticket === 'string' && row.ticket && row.ticket.includes('/')) {
      if (row.ticket.startsWith('http')) {
        row.ticketUrl = row.ticket;
      } else {
        row.ticket = row.ticket.replace(/^https?:\/\//, '');
        row.ticketUrl = `https://${row.ticket}`;
      }
    }

    // clean up description a bit and htmlize
    if (typeof row.description === 'string' && row.description) {
      row.description = row.description.replace(/\s?see less/gi, '');
    }
    row.descriptionHtml = textToHtml(row.description);

    // collect tags into an array proper
    row.tags = splitGenreTags(row.tags);
  });
  if (invalidTime) log.infoBuffer('Some of the startTime values were invalid.', { invalidTime });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  log.success(`Parsing events done.\nProcessed ${rows.length} rows.`);
  return rows;
};
