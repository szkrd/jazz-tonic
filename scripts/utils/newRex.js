const { escapeRegExp } = require('lodash');

module.exports = function newRex(text = '', flags = '') {
  return new RegExp(escapeRegExp(text), flags);
};
