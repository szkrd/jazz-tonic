window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.i18n = (() => {
  function removeAccents(text) {
    const a = 'ćčñéöúüóøőűáàíïÑÚÜÖØÓŐŰÉÀÁĆČÏÍ'.split('');
    const b = 'ccneouuooouaaiiNUUOOOOUEAACCII'.split('');
    a.forEach((from, idx) => (text = text.replaceAll(from, b[idx])));
    return text;
  }
  return {
    removeAccents,
  };
})();
