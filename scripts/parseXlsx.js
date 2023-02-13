const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const xlsJsonToRows = require('./utils/xlsJsonToRows');
const chalk = require('chalk');
const extractPlaceId = require('./utils/extractPlaceId');
const slugify = require('./utils/string/slugify');

const TABS = {
  places: 'places',
  main: 'wip (szabi)',
};

const LOCATIONS = {
  dataDir: '../data',
  xlsxFileName: 'main.xlsx',
  placesOutputFileName: 'places.json',
};

const dataDir = path.join(path.dirname(process.argv[1]).replace(/\\/g, '/'), LOCATIONS.dataDir);
const fileName = path.join(dataDir, LOCATIONS.xlsxFileName);
const workbook = xlsx.readFile(fileName, { cellHTML: false });
const sheetNames = Object.keys(workbook.Sheets);

function precheckSheets() {
  if (!sheetNames.includes(TABS.places)) {
    throw new Error(`Tab called "${TABS.places}" was not found in the xlsx file!`);
  }
  if (!sheetNames.includes(TABS.main)) {
    throw new Error(`Tab called "${TABS.main}" was not found in the xlsx file!`);
  }
}

function parsePlaces() {
  console.info('Parsing places...');
  const places = workbook.Sheets[TABS.places];
  const json = xlsx.utils.sheet_to_json(places, { blankrows: false, defval: null });
  const rows = xlsJsonToRows(json);
  // now places have the following cols:
  // rowIdx, name, address, fbEventUrl, url, email + we will add urlId
  rows.forEach((row) => {
    row.nameId = slugify(row.name);
    row.urlId = extractPlaceId(row.fbEventUrl, row.url);
  });
  fs.writeFileSync(path.join(dataDir, LOCATIONS.placesOutputFileName), JSON.stringify(rows, null, 2), 'utf-8');
  console.info('Done.');
}
function main() {
  precheckSheets();
  parsePlaces();
}

main();

// xlsx.set_fs(fs);

// /* load 'stream' for stream support */
// import { Readable } from 'stream';
// xlsx.stream.set_readable(Readable);

// /* load the codepage support library for extended support with older formats  */
// import * as cpexcel from 'xlsx/dist/cpexcel.full.mjs';
// xlsx.set_cptable(cpexcel);
