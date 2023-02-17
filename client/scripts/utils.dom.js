window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.dom = (() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const showEl = (el) => el.style.removeProperty('display');
  const hideEl = (el) => (el.style.display = 'none');
  return {
    $,
    $$,
    showEl,
    hideEl,
  };
})();
