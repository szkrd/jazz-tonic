const config = require('../../../rendererConfig.template.json');
const log = require('../../parser/modules/log');

let userConf = 'rendererConfig.json';
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

// validations
let error = '';
if (
  !Array.isArray(config.maximumDateRange) ||
  typeof config.maximumDateRange[0] !== 'number' ||
  config.maximumDateRange.length !== 2
)
  error = 'maximumDateRange must be a dayjs diff array value!';

['eventDateFormat', 'fakeDate'].forEach((key) => {
  if (!error && typeof config[key] !== 'string') error = `key "${key}" must be a string!`;
});

['minifyHtml', 'useFakeDate'].forEach((key) => {
  if (!error && typeof config[key] !== 'boolean') error = `key "${key}" must be a booelan (true or false)!`;
});

if (error) log.die(`Could not parse the configuration.\n${error}`);

// export
module.exports = config;
