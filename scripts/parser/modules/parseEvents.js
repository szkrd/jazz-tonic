const path = require('path');
const fs = require('fs');
const config = require('./config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const splitGenreTags = require('../utils/string/splitGenreTags');
const log = require('./log');
const validateCellKeysOrDie = require('../utils/validation/validateCellKeysOrDie');
const normalizeEventDate = require('../utils/date/normalizeEventDate');

module.exports = function parseEvents(eventsXlsx) {
  const fileName = path.join(config.dataDir, 'events.json');
  log.info('Parsing events...');
  const rows = xlsJsonToRows(eventsXlsx);
  rows.forEach((row) => {
    validateCellKeysOrDie(row, [
      'name',
      'date',
      'startTime',
      'endTime',
      'venue',
      'ticket',
      'description',
      'venueAddress',
      'performer',
      'genre',
      'tags',
    ]);
    if (typeof row.startDate === 'string' && row.startDate && !/^\d{2}:\d{2}$/.test(row.startDate)) {
      log.error(`Invalid startDate at ${row.rowIdx}, "${row.startDate}"!`);
      row.startDate = null;
    }
    let soldOut = 0;
    config.soldOutKeywords.forEach((keyword) => {
      soldOut += ((row.name || '').toLocaleLowerCase().match(keyword.toLocaleLowerCase()) || []).length;
    });
    row.soldOut = soldOut > 0;
    if (row.date) row.date = normalizeEventDate(row.date);
    if (row.genre) row.genre = row.genre.toLocaleLowerCase();
    // create a ticketUrl for ticket
    if (typeof row.ticket === 'string' && row.ticket && row.ticket.includes('/')) {
      if (row.ticket.startsWith('http')) {
        row.ticketUrl = row.ticket;
      } else {
        row.ticket = row.ticket.replace(/^https?\/\//, '');
        row.ticketUrl = `https://${row.ticket}`;
      }
    }
    // clean up description a bit
    if (typeof row.description === 'string' && row.description) {
      row.description = row.description.replace(/\s?see less/gi, '');
    }
    // collect tags into an array proper
    row.tags = splitGenreTags(row.tags);
  });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  log.success(`Parsing events done.\nProcessed ${rows.length} rows.`);
  return rows;
};
