window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.log = (() => {
  const isLocalHost = window.location.hostname === 'localhost';
  const hasForceEnable = window.location.hash.includes('log=1');
  const isEnabled = isLocalHost || hasForceEnable;
  const noop = () => {};

  const log = (...args) => console.log('[pv]', ...args);
  const info = (...args) => console.info('[pv]', ...args);
  const warn = (...args) => console.warn('[pv]', ...args);
  const error = (...args) => console.error('[pv]', ...args);

  if (!isEnabled) return { log: noop, info: noop, warn: noop, error };

  return { log, info, warn, error };
})();
