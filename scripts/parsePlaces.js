const fs = require('fs');
const { uniq } = require('lodash');
const xlsx = require('xlsx');
const extractUrlId = require('./utils/string/extractUrlId');
const slugify = require('./utils/string/slugify');
const xlsJsonToRows = require('./utils/xlsx/xlsJsonToRows');

module.exports = function (fileName, placesXlsx) {
  console.info('Parsing places...');
  const json = xlsx.utils.sheet_to_json(placesXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  const uniqIds = [];
  // now places have the following cols:
  // rowIdx, name, address, fbEventUrl, url, email + we will add urlId
  rows.forEach((row) => {
    row.ids = uniq(
      [slugify(row.name), row.id, extractUrlId(row.fbEventUrl), extractUrlId(row.url)]
        .map((id) => (id || '').trim())
        .filter((id) => id)
    );

    if (!row.id) {
      console.error(`Invalid row (${row.rowIdx})? Unable to calculate id, ignoring.`);
      row.ignore = true;
    } else {
      if (uniqIds.includes(row.id)) console.error(`Row id (${row.id}) is not unique?`);
      uniqIds.push(row.id);
    }
    if (row.address) {
      row.address = row.address.replace(/\s+/g, ' ').trim();
      const splitPoint = row.address.indexOf(',');
      const zipCity = row.address.substring(0, splitPoint).trim().toLowerCase();
      const streetPart = row.address.substring(splitPoint + 1).trim();
      const valid = /^\d{4} budapest$/.test(zipCity) && streetPart.length > 2;
      if (!valid) {
        console.error(
          `Invalid street address at row (${row.rowIdx}, ${row.name}).\n`,
          'Use "1234 Budapest, Foobar u. 1" format'
        );
      }
    }
  });
  rows = rows.filter((item) => !item.ignore);

  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  console.info(`Done. ${rows.length} rows.`);
  return rows;
};
