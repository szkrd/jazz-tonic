const xlsx = require('xlsx');
const config = require('./modules/config');
const log = require('./modules/log');
const parsePlaces = require('./modules/parsePlaces');
const parsePerformers = require('./modules/parsePerformers');

const workbook = xlsx.readFile(config.mainExcelFile, { cellHTML: false });
const sheetNames = Object.keys(workbook.Sheets);

function precheckSheets() {
  [config.xlsxTabPlaces, config.xlsxTabPerformers, config.xlsxTabEvents].forEach((key) => {
    if (!sheetNames.includes(key)) log.die(`Tab called "${key}" was not found in the xlsx file!`);
  });
}

function main() {
  precheckSheets();
  const placesData = parsePlaces(workbook.Sheets[config.xlsxTabPlaces]);
  const performersData = parsePerformers(workbook.Sheets[config.xlsxTabPerformers]);
  const eventsData = parsePerformers(workbook.Sheets[config.xlsxTabPerformers]);
  // TODO: parse events, then denormalize all of them into one main.json
}

main();
