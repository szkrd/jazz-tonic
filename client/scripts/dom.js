window.pv = window.pv || {};
window.pv.dom = (() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const show = (el) => el.style.removeProperty('display');
  const hide = (el) => (el.style.display = 'none');
  return {
    $,
    $$,
    show,
    hide,
  };
})();
