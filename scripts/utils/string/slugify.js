const removeAccents = require('../i18n/removeAccents');

/**
 * Removes special characters from a string,
 * trying to leave us with an id-like construct.
 * It also cuts away `()` and domain-like suffixes.
 */
module.exports = function slugify(text = '') {
  return removeAccents(String(text || ''))
    .toLocaleLowerCase()
    .replace(/\.(hu|com|sk)/, '')
    .replace(/[\s.\-_:,&'"]/g, '')
    .replaceAll('-', '')
    .replaceAll('–', '')
    .replace(/\([^)]*\)/g, '');
};
