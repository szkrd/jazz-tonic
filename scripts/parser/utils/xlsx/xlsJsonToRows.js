const xlsx = require('xlsx');
const { camelCase, last } = require('lodash');
const log = require('../../modules/log');

const STRINGIFY_FIELDS = ['date', 'startTime', 'endTime'];

/** Tries to retrieve the full metadata for a column, while ignoring hidden ones */
function getRawRow(workSheet, idx) {
  idx = idx + 2; // skip the header and it's one based
  // row idx 12 -> A12, B12, C12, D12...
  const keys = Object.keys(workSheet).filter((coord) => coord.replace(/^[A-Z]*/, '') === String(idx));
  // the values of A12, B12, C12... in an array
  // with column lookup to omit hidden cols
  const colData = workSheet['!cols'];
  return keys.filter((key, idx) => !(colData[idx] || {}).hidden).map((key) => workSheet[key]);
}

/** The raw object may have invalid keys (colums), like: '', _1, _2 etc. */
function removeInvalidKeys(obj) {
  const ret = {};
  Object.keys(obj)
    .filter((key) => key.trim() && !key.startsWith('_'))
    .forEach((key) => (ret[key] = obj[key]));
  // we should also need to remove nulls from the "end"
  // but this is already way too complex...
  return ret;
}

/**
 * Cleans up rows by ignoring the lines marked with ignore:1
 * and camelizes the row object keys.
 */
module.exports = function xlsJsonToRows(workSheet) {
  const rows = xlsx.utils.sheet_to_json(workSheet, {
    blankrows: false,
    defval: null,
    skipHidden: true, // skiphidden false did not really help
    rawNumbers: true,
    raw: true,
  });
  const ret = [];
  for (let idx = 0; idx < rows.length; idx++) {
    const item = rows[idx];
    if ([1, true, '1', 'true'].includes(item.ignore)) continue; // skip ignored lines
    const obj = { rowIdx: idx + 2 }; // add spreadsheet row number

    // since some values are stored as dates/numbers (which is desirable in most cases, but not here)
    // we will need the raw textual value, which can be found as "w" (stringified, human readable value)
    // but we also have to ignore the hidden columns, which makes it much harder
    const rawRow = getRawRow(workSheet, idx);
    const currentRow = Object.values(removeInvalidKeys(item));
    // checking the last col for equality would be MUCH better and harder (because of dangling nulls)
    if (rawRow[0].v !== currentRow[0])
      log.die(
        `Error parsing rows! Did you hide rows? Mismatch detected in row ${idx + 2}, raw vs json:\n` +
          JSON.stringify({ raw: rawRow[0].v, json: currentRow[0] }, null, 2)
      );

    Object.keys(item).forEach((oKey, keyIdx) => {
      let val = item[oKey];
      if (oKey.startsWith('_') || String(oKey).trim() === '') return; // skip hidden cols
      if (val === 'null') val = null;
      if (typeof val === 'string') val = val.trim().replace(/\s+/, ' '); // auto normalize string
      if (!oKey.startsWith('x-') && oKey !== 'ignore') {
        const newKey = camelCase(oKey).trim().replace(/\s+/g, ' '); // camelize keys
        if (STRINGIFY_FIELDS.includes(newKey)) val = rawRow[keyIdx]?.w ?? null; // use raw value
        obj[newKey] = val;
      }
    });
    ret.push(obj);
  }
  return ret;
};
