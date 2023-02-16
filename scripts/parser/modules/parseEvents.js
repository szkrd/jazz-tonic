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
    if (row.date) row.date = normalizeEventDate(row.date);
    if (row.genre) row.genre = row.genre.toLocaleLowerCase();
    row.tags = splitGenreTags(row.tags);
  });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  log.success(`Parsing events done.\nProcessed ${rows.length} rows.`);
  return rows;
};
