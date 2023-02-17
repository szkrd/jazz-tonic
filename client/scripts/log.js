window.pv = window.pv || {};
window.pv.log = (() => {
  const isLocalHost = window.location.hostname === 'localhost';
  const hasForceEnable = window.location.hash.includes('log=1');
  const isEnabled = isLocalHost || hasForceEnable;
  const noop = () => {};

  const info = (...args) => console.info('[pv]', ...args);
  const warn = (...args) => console.warn('[pv]', ...args);
  const error = (...args) => console.error('[pv]', ...args);

  if (!isEnabled) return { info: noop, warn: noop, error };

  return { info, warn, error };
})();
