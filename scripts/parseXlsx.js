const path = require('path');
const xlsx = require('xlsx');
const parseEvents = require('./parseEvents');
const parsePlaces = require('./parsePlaces');

const TABS = {
  places: 'places',
  main: 'wip (szabi)',
};

const LOCATIONS = {
  dataDir: '../data',
  xlsxFileName: 'main.xlsx',
  placesOutputFileName: 'places.json',
  eventsOutputFileName: 'events.json',
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

function main() {
  precheckSheets();
  const placesJsonFileName = path.join(dataDir, LOCATIONS.placesOutputFileName);
  const placesData = parsePlaces(placesJsonFileName, workbook.Sheets[TABS.places]);
  const eventsJsonFileName = path.join(dataDir, LOCATIONS.eventsOutputFileName);
  parseEvents(eventsJsonFileName, '2023-02-13', workbook.Sheets[TABS.main], placesData);
  // todo: denormalize
}

main();
