const fs = require('fs');
const path = require('path');
const config = require('../../../parserConfig.template.json');
const log = require('./log');

let userConf = 'parserConfig.json';
try {
  userConf =
    process.argv
      .slice(2)
      .find((arg) => arg.startsWith('--config='))
      ?.split('=')[1] || userConf;
  const localConfig = require(`../../../${userConf}`);
  Object.assign(config, localConfig);
  log.success(`Found "${userConf}", shallow overriding default values.`);
} catch {
  log.warning(`Could not find "${userConf}", using default values from the config template.`);
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

// fix sheet names (slashes are removed by the lib? or the online exporter?)
['xlsxTabPlaces', 'xlsxTabPerformers', 'xlsxTabEvents'].map((name) => {
  config[name] = config[name].replaceAll('/', '');
});

// export
module.exports = config;
