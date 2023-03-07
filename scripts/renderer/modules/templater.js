const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { minify } = require('html-minifier-terser');
const config = require('./config');
const log = require('../../parser/modules/log');

const templatesDir = './templates';
const { outDir } = config;

const __templateCache = {};
const __partialCache = {};
const __includeMap = {};

/** Render given value if the flag is true, return empty string otherwise */
function showIf(bool, val) {
  return val && bool ? String(val) : '';
}

function displayNoneIf(bool) {
  return bool ? 'style="display:none"' : '';
}

/**
 * Include a tpl in this file as a javascript variable attached
 * to the pv.templates object. If the magic INNER_CONTENT section
 * exists, then it strip away the outer parts first.
 */
function templatize(name) {
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
    `window.pv.templates.${name}=_.template(${JSON.stringify(text)});`,
    '</script>',
  ].join('');
}

/** Include a file as is. */
function include(fn) {
  if (__includeMap[fn]) return __includeMap[fn];
  let text = fs.readFileSync(path.join(templatesDir, fn), 'utf-8');
  __includeMap[fn] = text;
  return text.trim();
}

/** Includes a .svg file from the images directory */
function includeSvg(fn) {
  return include(`images/${fn}.svg`);
}

/** Returns file modification time and size concatenated as a poor man's cache bust hash */
function getFileHash(fn) {
  const fStats = fs.statSync(fn);
  return new Date(fStats.mtime) * 1 - new Date('2023-01-01') * 1 + '-' + fStats.size;
}

/** Creates a "link" tag for head for a css file, prepends folder, appends hash id */
function linkCss(fn) {
  if (Array.isArray(fn)) return fn.map(linkCss).join('');
  const htmlFn = `styles/${fn}.css`;
  const localFn = `client/${htmlFn}`;
  return `<link rel='stylesheet' href='${htmlFn}?r=${getFileHash(localFn)}' />`;
}

/**
 * Creates a "script" tag for head for a js file, prepends folder, appends hash id;
 * subdirectories are NOT supported for now;
 * "vendor/" prefix will render a link WITHOUT a hash suffix (use exact version numbers please).
 */
function linkJs(fn) {
  if (Array.isArray(fn)) return fn.map(linkJs).join('');
  const htmlFn = `scripts/${fn}.js`;
  const localFn = `client/${htmlFn}`;
  if (fn.startsWith('vendor/')) {
    return `<script src='scripts/${fn}.js'></script>`;
  }
  return `<script src='${htmlFn}?r=${getFileHash(localFn)}'></script>`;
}

const helpers = { showIf, displayNoneIf, templatize, include, includeSvg, linkCss, linkJs };

// NON HELPER FUNCTIONS
// ====================

const poorMinify = (text) =>
  text
    .replace(/<!--.*?-->/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n+/g, '\n');

/**
 * Recursively parses the `<%== "foo/bar" %> __EXACT__ syntax
 * to include files or text fragments. Included text will be stripped
 * of leading whitespaces.
 */
function injectPartials(text) {
  return text.replace(/<%==\s+"[^"]*"\s+%>/g, (match) => {
    const fn = './templates/' + match.split('"')[1] + '.tpl';
    const childText = __partialCache[fn] || poorMinify(fs.readFileSync(fn, 'utf-8'));
    __partialCache[fn] = childText;
    return injectPartials(childText);
  });
}

const getContext = (context) => ({ ...context, helpers });

const render = (text, context) => {
  text = injectPartials(text);
  const compile = _.template(text);
  return compile(getContext(context));
};

function renderAndSave(fn, context) {
  let text = fs.readFileSync(path.join(templatesDir, fn), 'utf-8');
  const outFn = fn.replace(/\.tpl$/, '.html');
  const dumpedContextFn = fn.replace(/\.tpl$/, '.dump');

  // first save the context for debugging
  fs.promises.writeFile(`${templatesDir}/${dumpedContextFn}`, JSON.stringify(context, null, 2));

  const saveOp = (textToSave) => fs.promises.writeFile(`${outDir}/${outFn}`, textToSave);
  let compiled = render(text, context);

  // I think the minifier library silently dies (does nothing) with this (though it works fine for the modal.tpl)
  if (config.minifyHtml) {
    log.info('Minifying output.', { conservativeCollapse: true, collapseWhitespace: true, maxLineLength: 1000 });
    compiled = poorMinify(compiled);
    minify(compiled).then(saveOp);
  } else {
    log.info('Not minifying, saving html as is.');
    saveOp(compiled);
  }
  log.info(`Compiled ${fn} and saved as ${outFn}`);
}

module.exports = { helpers, render, renderAndSave };
