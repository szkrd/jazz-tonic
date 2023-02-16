const fs = require('fs');
const path = require('path');
let hbs = require('handlebars');
const log = require('../parser/modules/log');

let mainJson = null;
try {
  mainJson = require('../../data/main.json');
} catch {
  log.die('Parsed data not found (in "data/main.json")?');
}

const templatesDir = path.join(path.dirname(process.argv[1]).replace(/\\/g, '/'), '../templates');
const outDir = path.join(path.dirname(process.argv[1]).replace(/\\/g, '/'), '../client');
let fileNames = [];

fs.readdirSync(templatesDir).forEach((fileName) => {
  if (fileName.endsWith('.hbs')) fileNames.push(fileName);
});

fileNames.forEach((fileName) => {
  fs.promises.readFile(path.join(templatesDir, fileName), 'utf-8').then((text) => {
    const template = text;
    const compile = hbs.compile(template);
    const compiled = compile(mainJson);
    fs.promises.writeFile(path.join(outDir, '/' + fileName.replace(/\.hbs$/, '.html')), compiled);
    log.info(`Compiled and saved ${fileName}`);
  });
});
