const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
let hbs = require('handlebars');
const { minify } = require('html-minifier-terser');
const config = require('./modules/config');
const log = require('../parser/modules/log');
const dayjs = require('dayjs');
require('dayjs/locale/hu');
const chalk = require('chalk');
const { mkdir } = require('shelljs');
const { sortBy, template } = require('lodash');

log.banner('rendering');

// the main json we use to render the data
let mainJson = null;
try {
  mainJson = require('../../data/main.json');
} catch {
  log.die('Parsed data not found (in "data/main.json")?');
}
mainJson.config = JSON.stringify({}); // add shared config here, should we need it

const rootDir = '.'; // use process argv 1?
const templatesDir = path.join(rootDir, '/templates');
const outDir = path.join(rootDir, '/client');

// HANDLEBARS HELPERS
// ==================

hbs.registerHelper('showif', (bool, val) => {
  return val && bool ? String(val) : '';
});

let __templateCache = {};
hbs.registerHelper('templatize', (options) => {
  const name = options.hash.file;
  let text = __templateCache[name] || fs.readFileSync(path.join(templatesDir, name + '.tpl'), 'utf-8');
  __templateCache[name] = text;
  const marker = { begin: '<!--INNER_CONTENT_BEGIN-->', end: '<!--INNER_CONTENT_END-->' };
  const markerPos = { begin: text.indexOf(marker.begin), end: text.indexOf(marker.end) };
  if (markerPos.begin > -1 && markerPos.end > -1) {
    text = text.substring(markerPos.begin + marker.begin.length, markerPos.end);
  }
  text = text.replace(/<!--.*?-->/g, '').trim();
  return [
    '<script type="text/javascript">',
    'window.pv.templates.modal=_.template(' + JSON.stringify(text) + ');',
    '</script>',
  ].join('');
});

const __includeMap = {};
hbs.registerHelper('require', (options) => {
  const fn = options.hash.file;
  if (__includeMap[fn]) return __includeMap[fn];
  let text = fs.readFileSync(path.join(templatesDir, fn), 'utf-8');
  __includeMap[fn] = text;
  return text;
});

// MODULES
// =======

function processEvents() {
  const baseDate = config.useFakeDate ? config.fakeDate : dayjs().format('YYYY-MM-DD');
  log.info(`Using ${config.useFakeDate ? 'FAKE ' : 'current '}base date "${chalk.greenBright(baseDate)}"`);

  // save per event static js data
  const dataUri = `/data-${baseDate}`;
  const currentDataDir = path.join(outDir, dataUri);
  if (!fs.existsSync(currentDataDir)) mkdir(currentDataDir);
  mainJson.dataDir = dataUri;

  // add hasEvents to root
  mainJson.hasEvents = mainJson.events.length > 0;

  // add release id and file hashes for cache busting
  mainJson.releaseId = Date.now();
  mainJson.buildDate = dayjs().format('YYYY-MM-DDTHH:mm:ss'); // local date
  mainJson.buildBy = process.env.username || process.env.USER || 'unknown';
  mainJson.fileHashes = {};
  const clientJsFiles = Array.from(shelljs.ls(outDir + '/scripts/**/*.js')).concat(
    shelljs.ls(outDir + '/styles/**/*.css')
  );
  clientJsFiles.forEach((fileName) => {
    const fStats = fs.statSync(fileName);
    mainJson.fileHashes[fileName.replace(/[/.]/g, '_')] =
      new Date(fStats.mtime) * 1 - new Date('2023-01-01') * 1 + '-' + fStats.size;
  });

  // global metadata (already stringified)
  mainJson.meta = JSON.stringify({
    releaseId: mainJson.releaseId,
    build: { date: mainJson.buildDate, user: mainJson.buildBy },
  });

  // create lodash template from the modal window so that we can save it as an html as well
  let subPageText = fs.readFileSync(path.join(templatesDir, 'modal.tpl'), 'utf-8');
  subPageText = subPageText
    .replace(/<!--.*?-->/g, '')
    .replace(/\n+/g, '\n')
    .trim();
  const subPageTpl = template(subPageText);

  mainJson.events.forEach((event) => {
    // add event.active to valid events (ones that are in range)
    let dateTime = event.date;
    if (event.startTime) dateTime += 'T' + event.startTime;
    event.active = dayjs(dateTime).isBefore(dayjs(baseDate).add(...config.maximumDateRange));
    event.hidden = !event.active;

    // add startDateTime, startDateTimeNumber and formattedDate
    event.startDateTime = dateTime;
    event.startDateTimeNumber = dayjs(dateTime).toDate() * 1;
    event.startDateTimeFormatted = dayjs(dateTime).locale('hu').format(config.eventDateFormat);

    // fix broken (?) dates where we have no start time at all
    if ((dateTime || '').match(/^\d{4}-\d{2}-\d{2}$/)) {
      event.startDateTimeFormatted = dayjs(dateTime).locale('hu').format(config.eventDateNoTimeFormat);
    }

    delete event.description; // we need only the descriptionHtml!

    // add relative data location (where the current event's js will be saved)
    event.dataUri = `${dataUri}/event-${event.rowIdx}.js?r=${mainJson.releaseId}`.replace(/^\//, '');
    event.dataUriForHtml = event.dataUri.replace(/\.js.*/, '.html');
    const eventDataFileName = path.join(currentDataDir, `/event-${event.rowIdx}`);
    fs.promises.writeFile(eventDataFileName + '.js', 'window.pv.addEvent(' + JSON.stringify(event) + ')', 'utf-8');

    // we always minify the modal, it's kinda messy without that,
    // but the whitespace collapse would make it much harder to debug that
    minify(subPageTpl({ ...event, subPage: true }), { collapseWhitespace: config.minifyHtml }).then((text) =>
      fs.promises.writeFile(eventDataFileName + '.html', text, 'utf-8')
    );
  });

  // keep only the active items for the template for now
  mainJson.events = mainJson.events.filter((event) => event.active);

  // last minute sort
  mainJson.events = sortBy(mainJson.events, ['startDateTimeNumber']);
} // end processEvents

function renderTemplates() {
  let fileNames = [];
  fs.readdirSync(templatesDir).forEach((fileName) => {
    if (fileName.endsWith('.hbs')) fileNames.push(fileName);
  });

  fileNames.forEach((fileName) => {
    fs.promises.readFile(path.join(templatesDir, fileName), 'utf-8').then((text) => {
      const template = text;
      const compile = hbs.compile(template);
      let compiled = compile(mainJson);
      const docType = '<!DOCTYPE html>'; // someone ate our doctype
      if (!compiled.startsWith(docType)) compiled = `${docType}\n${compiled}`;
      fs.promises.writeFile(path.join(templatesDir, '/templateData.dump'), JSON.stringify(mainJson, null, 2));

      const outFileName = fileName.replace(/\.hbs$/, '.html');
      const saveOp = (text) => fs.promises.writeFile(path.join(outDir, '/' + outFileName), text);

      if (config.minifyHtml) {
        log.info('Minifying.', { conservativeCollapse: true, collapseWhitespace: true, maxLineLength: 1000 });
        minify(compiled).then(saveOp);
      } else {
        log.info('Not minifying, saving html as is.');
        saveOp(compiled);
      }
      log.info(`Compiled ${fileName} and saved as ${outFileName}`);
    });
  });
}

// MAIN
// ====

function main() {
  processEvents();
  renderTemplates();
}

main();
