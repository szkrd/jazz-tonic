const fs = require('fs');
const path = require('path');
const config = require('../../../parserConfig.template.json');
const log = require('./log');

try {
  const localConfig = require('../../../parserConfig.json');
  Object.assign(config, localConfig);
} catch {
  console.info('Could not find "parserConfig.json", using the default values from the template.');
}

const mainExcelFile = path.join(
  path.dirname(process.argv[1].replace(/\\/g, '/').replace(/\/index\.js$/), ''),
  '../',
  config.mainExcelFile
);
const dataDir = path.dirname(mainExcelFile);

config.dataDir = dataDir;
config.mainExcelFile = mainExcelFile;

// validations
let error = '';
if (!fs.existsSync(mainExcelFile)) error = "mainExcelFile doesn't exist?";

['xlsxTabPerformers', 'xlsxTabPlaces', 'xlsxTabEvents'].forEach((key) => {
  if (!error && typeof config[key] !== 'string') error = `key "${key}" must be a string!`;
});

if (error) log.die(`Could not parse the configuration.\n${error}`);

// export
module.exports = config;
