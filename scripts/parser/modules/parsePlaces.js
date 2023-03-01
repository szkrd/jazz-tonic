const path = require('path');
const fs = require('fs');
const isValidAddress = require('../utils/validation/isValidAddress');
const config = require('../modules/config');
const xlsJsonToRows = require('../utils/xlsx/xlsJsonToRows');
const log = require('./log');
const validateCellKeysOrDie = require('../utils/validation/validateCellKeysOrDie');
const slugify = require('../utils/string/slugify');
const removeUnknownKeys = require('../utils/object/removeUnknownKeys');

const COLS = ['rowIdx', 'name', 'address', 'fbEventUrl', 'email'];

module.exports = function parsePlaces(workSheet) {
  const fileName = path.join(config.dataDir, 'places.json');
  log.info('Parsing places...');
  const rows = xlsJsonToRows(workSheet);
  let invalidAddressCount = 0;
  const slugNames = [];
  const slugAddresses = [];
  rows.forEach((row) => {
    validateCellKeysOrDie(row, COLS);
    removeUnknownKeys(row, COLS);

    // name and address should be primary keys
    const slugName = slugify(row.name);
    const slugAddress = slugify(row.address);
    if (slugNames.includes(slugName) && slugAddresses.includes(slugAddress))
      log.warning(`Duplicate place? ${row.name} / ${row.address}`);

    if (!isValidAddress(row.address)) {
      invalidAddressCount++;
      log.warning(`Invalid street address at row #${row.rowIdx} (place name is "${row.name}")`);
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  if (invalidAddressCount > 0) {
    log.info(`You had ${invalidAddressCount} invalid address(es), please use "1234 Budapest, Foobar u. 1" format.`);
  }
  log.success(`Parsing places done.\nProcessed ${rows.length} rows.`);
  return rows;
};
