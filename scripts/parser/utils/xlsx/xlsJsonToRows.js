const xlsx = require('xlsx');
const { camelCase } = require('lodash');
const log = require('../../modules/log');

/**
 * Cleans up rows by ignoring the lines marked with ignore:1
 * and camelizes the row object keys.
 */
module.exports = function xlsJsonToRows(workSheet, debug = false) {
  const rows = xlsx.utils.sheet_to_json(workSheet, {
    blankrows: false,
    defval: null,
    skipHidden: false, // skiphidden true will show the hidden cols, but do not expect them to have useful names...
    rawNumbers: false, // prefer strings over numbers even for dates
    raw: false,
  });
  const ret = [];
  if (debug) log.debug(rows);
  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    if ([1, true, '1', 'true'].includes(row.ignore)) continue; // skip ignored lines
    const obj = { rowIdx: idx + 2 }; // add spreadsheet row number
    let unknownColId = 1;
    Object.keys(row).forEach((oKey) => {
      let val = row[oKey];
      const loVal = String(val).toLocaleLowerCase();
      // columns without a name must be skipped, sorry
      if (String(oKey).trim() === '') {
        return;
      }
      // col names starting with "_"
      if (oKey.startsWith('_')) {
        oKey = `unknownCol${unknownColId++}`;
      }
      // string nulls can be treated as useless
      if (val === 'null') {
        val = null;
      }
      if (loVal === '#n/a') {
        val = null;
      }
      // auto normalize string values (pretty much everything if raw parsing is off)
      if (typeof val === 'string') {
        val = val
          .trim()
          .replace(/[ \t]+/g, ' ') // tabs and "classic" spaces
          .replace(/\r\n/g, '\n'); // windows line endings to linux
      }

      // finally we can deal with a simple column
      const newKey = camelCase(oKey).trim().replace(/\s+/g, ' '); // camelize keys
      if (newKey in obj)
        log.die(
          'There seem to be multiple columns with the same name pattern (in row 1)!\n' + `"${oKey}" / "${newKey}"`
        );
      obj[newKey] = val;
    });
    ret.push(obj);
  }
  return ret;
};
