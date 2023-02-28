window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.dom = (() => {
  const { log } = window.pv.utils;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const showEl = (el) => el.style.removeProperty('display');
  const hideEl = (el) => (el.style.display = 'none');
  const toggleEl = (el) => (el.style.display === 'none' ? showEl(el) : hideEl(el));

  function triggerInputEvent(el) {
    const event = new Event('input', { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
  }

  function getInnerText(selectorOrEl, rootEl) {
    const el = selectorOrEl instanceof HTMLElement ? selectorOrEl : $(selectorOrEl, rootEl);
    if (!el) {
      log.warn('Element for not found.', { selectorOrEl, rootEl });
      return '';
    }
    return el.innerText.trim();
  }

  function escapeHtml(text = '') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return {
    $,
    $$,
    showEl,
    hideEl,
    toggleEl,
    triggerInputEvent,
    getInnerText,
    escapeHtml,
  };
})();
