const config = require('../../../rendererConfig.template.json');
const log = require('../../parser/modules/log');

try {
  const localConfig = require('../../../rendererConfig.json');
  Object.assign(config, localConfig);
} catch {
  console.info('Could not find "rendererConfig.json", using the default values from the template.');
}

// validations
let error = '';
if (
  !Array.isArray(config.maximumDateRange) ||
  typeof config.maximumDateRange[0] !== 'number' ||
  config.maximumDateRange.length !== 2
)
  error = 'maximumDateRange must be a dayjs diff array value!';

['templateOutput', 'fakeDate'].forEach((key) => {
  if (!error && typeof config[key] !== 'string') error = `key "${key}" must be a string!`;
});

['useFakeDate'].forEach((key) => {
  if (!error && typeof config[key] !== 'boolean') error = `key "${key}" must be a booelan (true or false)!`;
});

if (error) log.die(`Could not parse the configuration.\n${error}`);

// export
module.exports = config;
