const { camelCase } = require('lodash');

/**
 * Cleans up rows by ignoring the lines marked with ignore:1
 * and camelizes the row object keys.
 */
module.exports = function xlsJsonToRows(rows) {
  const ret = [];
  for (let idx = 0; idx < rows.length; idx++) {
    const item = rows[idx];
    if ([1, true, '1', 'true'].includes(item.ignore)) continue; // skip ignored lines
    const obj = { rowIdx: idx + 2 }; // add spreadsheet row number
    Object.keys(item).forEach((oKey) => {
      let val = item[oKey];
      if (typeof val === 'string') val = val.trim().replace(/\s+/, ' '); // auto normalize string
      if (!oKey.startsWith('x-') && oKey !== 'ignore') {
        const newKey = camelCase(oKey).trim().replace(/\s+/g, ' '); // camelize keys
        obj[newKey] = val;
      }
    });
    ret.push(obj);
  }
  return ret;
};