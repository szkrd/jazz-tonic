module.exports = function removeUnknownKeys(obj, blacklist) {
  const keys = Object.keys(obj);
  for (let idx = 0; idx < keys.length; idx++) {
    const key = keys[idx];
    if (!blacklist.includes(key)) delete obj[key];
  }
};
