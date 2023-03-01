window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.storage = (() => {
  const log = window.pv.utils.log || console;

  let values = {
    darkTheme: 0,
    searchTerm: '',
    // storing the opened event would not work,
    // since rowIdx is not stable between builds
  };

  // saving the searchterm can be considered annoying, so let's skip that for now
  const DISABLED_KEYS = ['searchTerm'];

  function save(key, value) {
    if (DISABLED_KEYS.includes(key)) return;
    if (key) {
      values[key] = value;
    }
    try {
      localStorage.setItem('pv', JSON.stringify(values));
    } catch (err) {
      log.error('Localstorage save error:', err);
    }
  }

  function load(key) {
    if (DISABLED_KEYS.includes(key)) return null;
    let storedValues = values;
    try {
      storedValues = JSON.parse(localStorage.getItem('pv') || 'null') || storedValues;
      values = storedValues;
    } catch (err) {
      log.error('Localstorage load error:', err);
    }
    return key === undefined ? storedValues : storedValues[key];
  }

  // get the last used value
  load();

  return {
    save,
    load,
  };
})();
