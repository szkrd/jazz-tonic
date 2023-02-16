const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const config = require('./config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const splitGenreTags = require('../utils/string/splitGenreTags');

module.exports = function parseEvents(eventsXlsx) {
  const fileName = path.join(config.dataDir, 'events.json');
  console.info('Parsing events...');
  const json = xlsx.utils.sheet_to_json(eventsXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  rows.forEach((row) => {
    if (row.genre) {
      row.genre = row.genre.toLocaleLowerCase();
    }
    row.tags = splitGenreTags(row.tags);
  });
  rows = rows.filter((item) => !item.ignore);
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  console.info(`Parsing events done.\nProcessed ${rows.length} rows.`);
  return rows;
};
