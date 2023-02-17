window.pv = window.pv || {};
window.pv.string = (() => {
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
