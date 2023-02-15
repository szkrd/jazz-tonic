module.exports = function isValidAddress(text) {
  let rowAddress = (text || '').trim();
  if (!rowAddress) return false;
  rowAddress = rowAddress.replace(/\s+/g, ' ').trim();
  const splitPoint = rowAddress.indexOf(',');
  const zipCity = rowAddress.substring(0, splitPoint).trim().toLowerCase();
  const streetPart = rowAddress.substring(splitPoint + 1).trim();
  const valid = /^\d{4} budapest$/.test(zipCity) && streetPart.length > 2;
  return valid;
};
