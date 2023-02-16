const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const splitGenreTags = require('../utils/string/splitGenreTags');
const log = require('./log');

module.exports = function parsePerformers(performersXlsx) {
  const fileName = path.join(config.dataDir, 'performers.json');
  log.info('Parsing performers...');
  const json = xlsx.utils.sheet_to_json(performersXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  rows.forEach((row) => {
    // genre
    if (row.genre) {
      row.genre = row.genre.toLocaleLowerCase(); // trimming was done in the generic parser
    } else {
      log.warning(`Missing genre at row (${row.rowIdx}, ${row.name})`);
    }
    // tag to tags
    row.tags = splitGenreTags(row.tags);
  });
  rows = rows.filter((item) => !item.ignore);
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  log.success(`Parsing performers done.\nProcessed ${rows.length} rows.`);
  return rows;
};
