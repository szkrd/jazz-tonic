const templater = require('./modules/templater');
const log = require('../parser/modules/log');
const processMainJson = require('./modules/processMainJson');

log.banner('rendering');

// the main json we use to render the data
let mainJson = null;
try {
  mainJson = require('../../data/main.json');
} catch {
  log.die('Parsed data not found (in "data/main.json")?');
}
mainJson.config = JSON.stringify({}); // add shared config here, should we need it

// MAIN
// ====

function main() {
  processMainJson(mainJson);
  templater.renderAndSave('index.tpl', mainJson);
}

main();
