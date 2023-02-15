const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const isValidAddress = require('../utils/validation/isValidAddress');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');

module.exports = function parsePlaces(placesXlsx) {
  const fileName = path.join(config.dataDir, 'places.json');
  console.info('Parsing places...');
  const json = xlsx.utils.sheet_to_json(placesXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  rows.forEach((row) => {
    if (!isValidAddress(row.address)) {
      console.error(
        `Invalid street address at row (${row.rowIdx}, ${row.name}).\n`,
        'Use "1234 Budapest, Foobar u. 1" format'
      );
    }
  });
  rows = rows.filter((item) => !item.ignore);
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  console.info(`Parsing places done.\nProcessed ${rows.length} rows.`);
  return rows;
};
