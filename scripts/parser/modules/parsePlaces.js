const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const isValidAddress = require('../utils/validation/isValidAddress');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const log = require('./log');

module.exports = function parsePlaces(placesXlsx) {
  const fileName = path.join(config.dataDir, 'places.json');
  log.info('Parsing places...');
  const json = xlsx.utils.sheet_to_json(placesXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  let invalidAddressCount = 0;
  rows.forEach((row) => {
    if (!isValidAddress(row.address)) {
      invalidAddressCount++;
      log.warning(`Invalid street address at row (${row.rowIdx}, ${row.name})`);
    }
  });
  rows = rows.filter((item) => !item.ignore);
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  if (invalidAddressCount > 0) {
    log.info(`You had ${invalidAddressCount} invalid address(es), please use "1234 Budapest, Foobar u. 1" format.`);
  }
  log.success(`Parsing places done.\nProcessed ${rows.length} rows.`);
  return rows;
};
