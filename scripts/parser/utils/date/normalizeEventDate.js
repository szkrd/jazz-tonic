const log = require('../../modules/log');
const isValidDate = require('../validation/isValidDate');

module.exports = function normalizeEventDate(text) {
  // it's already okay: 2000-12-01
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (!isValidDate(text)) {
    log.warning(`Invalid date "${text}", ignoring!`);
    return null;
  }
  // convert from M/D/YY
  const parts = text.split('/');
  let month = parseInt(parts[0], 10);
  let day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (day < 10) day = '0' + String(day);
  if (month < 10) month = '0' + String(month);
  if (year < 100) year = 2000 + year;
  return [year, month, day].join('-');
};
