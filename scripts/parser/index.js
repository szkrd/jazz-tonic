const xlsx = require('xlsx');
const config = require('./modules/config');
const parsePlaces = require('./modules/parsePlaces');
const parsePerformers = require('./modules/parsePerformers');

const workbook = xlsx.readFile(config.mainExcelFile, { cellHTML: false });
const sheetNames = Object.keys(workbook.Sheets);

function precheckSheets() {
  const checkTab = (key) => {
    if (!sheetNames.includes(key)) {
      throw new Error(`Tab called "${key}" was not found in the xlsx file!`);
    }
  };
  [config.xlsxTabPlaces, config.xlsxTabPerformers, config.xlsxTabEvents].forEach(checkTab);
}

function main() {
  precheckSheets();
  const placesData = parsePlaces(workbook.Sheets[config.xlsxTabPlaces]);
  const performersData = parsePerformers(workbook.Sheets[config.xlsxTabPerformers]);
  // TODO: parse events, then denormalize all of them into one main.json
  console.log('WIP >>>', placesData.length, performersData.length);
}

main();
