window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.url = (() => {
  /**
   * Parses query string into an object using URLSearchParams:
   * `?foo=1&bar=2` -> `{ foo: '1', bar: '2' }`
   */
  function parse(text) {
    text = text ?? window.location.search;
    return Object.fromEntries(new URLSearchParams(text));
  }

  /**
   * Converts object to query string using URLSearchParams:
   * `{ foo: '1', bar: '2' }` -> `foo=1&bar=2`
   */
  function from(obj) {
    const params = new URLSearchParams('');
    for (const prop in obj) params.append(prop, String(obj[prop]));
    return params.toString();
  }

  const queryString = { from, parse };

  return { queryString };
})();
