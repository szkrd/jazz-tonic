(() => {
  const dayjs = window.dayjs;
  const { templates, modules } = window.pv;
  const { log, url, resource, storage } = window.pv.utils;
  const { $, $$, showEl } = window.pv.utils.dom;

  let currentDate = dayjs().format('YYYY-MM-DD');
  const elements = {
    searchInput: $('.js-search-input'),
    modalContent: $('.js-modal-content'),
    themeButtons: { light: $('.js-theme-button-light'), dark: $('.js-theme-button-dark') },
  };

  const showModal = () => {
    $('body').classList.add('show-modal');
    elements.modalContent.innerHTML = '<div class="loader">Loading...</div>';
  };
  const hideModal = () => $('body').classList.remove('show-modal');

  /**
   * Parses and uses the debug related overrides from the url's search part (?x=123)
   */
  function useUrlDebugOptions() {
    const params = url.queryString.parse();
    if (params.currentDate) {
      currentDate = params.currentDate;
      log.info(
        `Overriding current date with ${currentDate} - ` +
          'this will affect how many events are considered to be in the past.'
      );
    }
  }

  /**
   * On key up search for substrings in the name content of the events
   */
  function manageSearchField() {
    showEl(elements.searchInput);
    const { searchAndFilter } = modules.events;
    elements.searchInput.value = storage.load('searchTerm');
    elements.searchInput.addEventListener('keyup', (keyEvt) => searchAndFilter(keyEvt.target.value.trim()));
    elements.searchInput.addEventListener('focus', (keyEvt) => keyEvt.target.select());
    searchAndFilter(elements.searchInput.value.trim());
  }

  function addModalCloseEventHandler() {
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
            elements.modalContent.innerHTML = templates.modal(event);
            const formattedTagsClone = $('.js-event-genres-tags-merged', eventContainer).cloneNode(true);
            $('.js-tags-copy-target').appendChild(formattedTagsClone);
          })
          .catch((err) => {
            log.error(`Download failed for js resource url "${href}"!`, err);
            elements.modalContent.innerHTML =
              '<p class="modal-error-message">Hiba történt az esemény betöltésekor!</p>';
          });
      });
    });
  }

  /**
   * Handle theme switching using body class
   */
  function manageThemeSwitcher() {
    const isDark = storage.load('darkTheme') === 1;
    elements.themeButtons[isDark ? 'dark' : 'light'].classList.add('selected');
    if (isDark) document.body.parentNode.classList.add('theme-dark');
    const setDarkMode = (el, flag) => {
      $$('button', el.parentNode).forEach((el) => el.classList.remove('selected'));
      el.classList.add('selected');
      storage.save('darkTheme', flag * 1);
      document.body.parentNode.classList[flag ? 'add' : 'remove']('theme-dark');
    };
    elements.themeButtons.dark.addEventListener('click', (clickEvt) => setDarkMode(clickEvt.currentTarget, true));
    elements.themeButtons.light.addEventListener('click', (clickEvt) => setDarkMode(clickEvt.currentTarget, false));
  }

  // --------------------------------------------------------------------------

  (function main() {
    const { collectEventsFromDom } = modules.events;
    const hideDatesInThePast = () => modules.events.hideDatesInThePast(currentDate);
    useUrlDebugOptions();
    collectEventsFromDom();
    hideDatesInThePast();
    setInterval(hideDatesInThePast, 1000 * 60 * 60 * 12); //check every 12 hours for old events
    manageSearchField();
    manageThemeSwitcher();
    addModalOpener();
    addModalCloseEventHandler();
  })();
})();
