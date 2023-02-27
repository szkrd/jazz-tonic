const path = require('path');
const fs = require('fs');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const splitGenreTags = require('../utils/string/splitGenreTags');
const log = require('./log');
const validateCellKeysOrDie = require('../utils/validation/validateCellKeysOrDie');
const removeUnknownKeys = require('../utils/object/removeUnknownKeys');

const COLS = ['rowIdx', 'name', 'genre', 'tags'];

module.exports = function parsePerformers(workSheet) {
  const fileName = path.join(config.dataDir, 'performers.json');
  log.info('Parsing performers...');
  const rows = xlsJsonToRows(workSheet);
  rows.forEach((row) => {
    validateCellKeysOrDie(row, COLS);
    removeUnknownKeys(row, COLS);

    // genre
    if (row.genre) {
      row.genre = row.genre.toLocaleLowerCase(); // trimming was done in the generic parser
    } else {
      log.warning(`Missing genre at row (${row.rowIdx}, ${row.name})`);
    }
    // tag to tags
    row.tags = splitGenreTags(row.tags);
  });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  log.success(`Parsing performers done.\nProcessed ${rows.length} rows.`);
  return rows;
};
