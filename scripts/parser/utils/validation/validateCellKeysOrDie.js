const log = require('../../modules/log');
const arrayContainsValues = require('./arrayContainsValues');

module.exports = function validateCellKeysOrDie(row, colNames) {
  if (!arrayContainsValues(Object.keys(row), colNames))
    log.die(
      `Missing columns for item ${row.rowIdx}?\n` +
        `These are the normalized column names we need: ${colNames.join(', ')}`
    );
};
