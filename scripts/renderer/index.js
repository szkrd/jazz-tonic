const path = require('path');
const shelljs = require('shelljs');
const { existsSync } = require('fs');
const config = require('./modules/config');
const templater = require('./modules/templater');
const log = require('../parser/modules/log');
const processMainJson = require('./modules/processMainJson');

log.banner('rendering');

// the main json we use to render the data
let mainJson = null;
try {
  mainJson = require(`../../${config.inputJson}`);
} catch {
  log.die(`Parsed data not found (in "${config.inputJson}")?`);
}
mainJson.config = JSON.stringify({}); // add shared config here, should we need it

// MAIN
// ====

function main() {
  // if the outDir is missing, then we create it and use the
  // "./client" dir to fill it up with the original files
  if (!existsSync(config.outDir)) {
    shelljs.mkdir(config.outDir);
  }
  if (!['client', './client'].includes(config.outDir)) {
    log.info(`Copying static files (without data-*) from ./client to ${config.outDir}`);
    shelljs
      .ls('./client')
      .filter((fn) => !fn.startsWith('data-'))
      .forEach((fn) => {
        shelljs.cp('-R', `./client/${fn}`, path.join(config.outDir, fn));
      });
  }

  log.info(`Input: ${config.inputJson}\nOutput: ${config.outDir}`);
  processMainJson(mainJson);
  templater.renderAndSave('index.tpl', mainJson);
}

main();
