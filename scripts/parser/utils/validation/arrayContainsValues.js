module.exports = function arrayContainsValues(arr, keys) {
  for (let idx = 0; idx < keys.length; idx++) {
    const key = keys[idx];
    if (!arr.includes(key)) return false;
  }
  return true;
};
