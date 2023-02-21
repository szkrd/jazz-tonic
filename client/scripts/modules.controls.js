window.pv = window.pv || {};
window.pv.modules = window.pv.modules || {};
window.pv.modules.controls = (() => {
  const { templates, modules } = window.pv;
  const { log, resource, storage } = window.pv.utils;
  const { $, $$, showEl } = window.pv.utils.dom;

  // SEARCH FIELD
  // ============

  /**
   * On key up search for substrings in the name content of the events
   */
  function setupSearchField() {
    const searchInput = $('.js-search-input');
    showEl(searchInput);
    const { searchAndFilter } = modules.events;
    searchInput.value = storage.load('searchTerm');
    searchInput.addEventListener('keyup', (keyEvt) => searchAndFilter(keyEvt.target.value.trim()));
    searchInput.addEventListener('focus', (keyEvt) => keyEvt.target.select());
    searchAndFilter(searchInput.value.trim());
  }

  // MODAL
  // =====

  const setModalInnerContent = (html) => ($('.js-modal-content').innerHTML = html);

  const showModal = () => {
    $('body').classList.add('show-modal');
    setModalInnerContent('<div class="loader">Loading...</div>');
  };

  const hideModal = () => $('body').classList.remove('show-modal');

  function addModalCloseHandler() {
    $('.js-modal-close').addEventListener('click', hideModal);
    document.addEventListener('keyup', (keyEvt) => {
      if (keyEvt.key === 'Escape') hideModal();
    });
  }

  /**
   * Handle click on the whole event rows, triggering the script-download for the modal
   */
  function addModalOpener() {
    $$('.js-event-details-opener').forEach((el) => {
      const eventContainer = el.closest('.js-clickable-row');
      eventContainer.addEventListener('keyup', (keyEvt) => {
        if (keyEvt.key === 'Enter') eventContainer.click();
      });
      eventContainer.addEventListener('click', (clickEvt) => {
        clickEvt.preventDefault();
        clickEvt.stopPropagation();
        document.activeElement.blur();
        const eventId = parseInt(clickEvt.currentTarget.getAttribute('id').replace(/^event-/, ''), 10);
        const el = $('.js-event-details-opener', clickEvt.currentTarget);
        const href = el.getAttribute('href');
        showModal();
        resource.download
          .js(href)
          .then(() => {
            log.info(`Downloaded script resource "${href}"`);
            const event = modules.events.findEventByRowIdx(eventId);
            setModalInnerContent(templates.modal(event));
            const formattedTagsClone = $('.js-event-genres-tags-merged', eventContainer).cloneNode(true);
            $('.js-tags-copy-target').appendChild(formattedTagsClone);
          })
          .catch((err) => {
            log.error(`Download failed for js resource url "${href}"!`, err);
            setModalInnerContent('<p class="modal-error-message">Hiba történt az esemény betöltésekor!</p>');
          });
      });
    });
  }

  // THEME SWITCHER
  // ==============

  /**
   * Handle theme switching using body class
   */
  function setupThemeSwitcher() {
    const themeButtons = { light: $('.js-theme-button-light'), dark: $('.js-theme-button-dark') };
    const isDark = storage.load('darkTheme') === 1;
    themeButtons[isDark ? 'dark' : 'light'].classList.add('selected');
    if (isDark) document.body.parentNode.classList.add('theme-dark');
    const setDarkMode = (el, flag) => {
      $$('button', el.parentNode).forEach((el) => el.classList.remove('selected'));
      el.classList.add('selected');
      storage.save('darkTheme', flag * 1);
      document.body.parentNode.classList[flag ? 'add' : 'remove']('theme-dark');
    };
    themeButtons.dark.addEventListener('click', (clickEvt) => setDarkMode(clickEvt.currentTarget, true));
    themeButtons.light.addEventListener('click', (clickEvt) => setDarkMode(clickEvt.currentTarget, false));
  }

  const setupControls = () => {
    setupSearchField();
    setupThemeSwitcher();
    addModalCloseHandler();
    addModalOpener();
  };

  return { setup: setupControls };
})();
