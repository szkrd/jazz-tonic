const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');

module.exports = function parsePerformers(performersXlsx) {
  const fileName = path.join(config.dataDir, 'performers.json');
  console.info('Parsing performers...');
  const json = xlsx.utils.sheet_to_json(performersXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  rows.forEach((row) => {
    // genre
    if (row.genre) {
      row.genre = row.genre.toLocaleLowerCase(); // trimming was done in the generic parser
    } else {
      console.error(`Missing genre at row (${row.rowIdx}, ${row.name})`);
    }
    // tag to tags
    if (row.tags && typeof row.tags === 'string') {
      row.tags = row.tags.split(',').map((tag) => tag.replace(/\s+/g, ' ').trim().toLocaleLowerCase());
    } else {
      row.tags = null;
    }
  });
  rows = rows.filter((item) => !item.ignore);
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  console.info(`Parsing performers done.\nProcessed ${rows.length} rows.`);
  return rows;
};
