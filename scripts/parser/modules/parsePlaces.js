const path = require('path');
const fs = require('fs');
const isValidAddress = require('../utils/validation/isValidAddress');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const log = require('./log');
const validateCellKeysOrDie = require('../utils/validation/validateCellKeysOrDie');

module.exports = function parsePlaces(workSheet) {
  const fileName = path.join(config.dataDir, 'places.json');
  log.info('Parsing places...');
  const rows = xlsJsonToRows(workSheet);
  let invalidAddressCount = 0;
  rows.forEach((row) => {
    validateCellKeysOrDie(row, ['name', 'address', 'fbEventUrl', 'email']);
    if (!isValidAddress(row.address)) {
      invalidAddressCount++;
      log.warning(`Invalid street address at row (${row.rowIdx}, ${row.name})`);
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  if (invalidAddressCount > 0) {
    log.info(`You had ${invalidAddressCount} invalid address(es), please use "1234 Budapest, Foobar u. 1" format.`);
  }
  log.success(`Parsing places done.\nProcessed ${rows.length} rows.`);
  return rows;
};
