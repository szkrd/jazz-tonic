const fs = require('fs');
const path = require('path');
const config = require('../../../parserConfig.template.json');

try {
  const localConfig = require('../../../parserConfig.json');
  Object.assign(config, localConfig);
} catch {
  console.info('Could not find "parserConfig.json", using the default values from the template.');
}

const mainExcelFile = path.join(path.dirname(process.argv[1]).replace(/\\/g, '/'), '../', config.mainExcelFile);
const dataDir = path.dirname(mainExcelFile);

config.dataDir = dataDir;
config.mainExcelFile = mainExcelFile;

// validations
let error = '';
if (!fs.existsSync(mainExcelFile)) error = "mainExcelFile doesn't exist?";
if (
  !Array.isArray(config.maximumDateRange) ||
  typeof config.maximumDateRange[0] !== 'number' ||
  config.maximumDateRange.length !== 2
)
  error = 'maximumDateRange must be a dayjs diff array value!';

['xlsxTabPerformers', 'xlsxTabPlaces', 'xlsxTabEvents'].forEach((key) => {
  if (!error && typeof config[key] !== 'string') error = `key "${key}" must be a string!`;
});

if (error) throw new Error(`Could not parse the configuration.\n${error}`);

// export
module.exports = config;
