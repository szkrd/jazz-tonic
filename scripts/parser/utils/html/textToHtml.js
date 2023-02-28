const escapeHtml = require('./escapeHtml');

function addHtmlLineBreaks(text = '') {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br>\n');
}

module.exports = function textToHtml(text = '') {
  text = escapeHtml(text);
  return addHtmlLineBreaks(text);
};
