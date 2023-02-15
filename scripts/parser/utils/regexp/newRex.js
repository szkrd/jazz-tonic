const { escapeRegExp } = require('lodash');

/**
 * Creates RegExp from string with escaping.
 */
module.exports = function newRex(text = '', flags = '') {
  return new RegExp(escapeRegExp(text), flags);
};
