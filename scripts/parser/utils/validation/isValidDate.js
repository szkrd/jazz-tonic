module.exports = function isValidDate(text) {
  const parts = text.split('/');
  if (parts.length !== 3) return false;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (year < 100) year = 2000 + year; // probably not a good idea after 2099 :)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  return month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 2000 && year < 3000;
};
