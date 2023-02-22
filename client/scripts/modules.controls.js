window.pv = window.pv || {};
window.pv.modules = window.pv.modules || {};
window.pv.modules.controls = (() => {
  const _ = window._;
  const { templates, modules } = window.pv;
  const { log, resource, storage, url, date } = window.pv.utils;
  const { $, $$, showEl, hideEl, triggerInputEvent } = window.pv.utils.dom;

  // SEARCH FIELD
  // ============

  function markTagBasedOnSearchField(text) {
    const tagEls = $$('.js-clickable-tag-filter .js-event-genre');
    tagEls.forEach((node) => node.classList.remove('selected'));
    const tags = ((text + ' ').match(/tag:[^\s]*\s/gi) || []).map((text) => text.replace(/^tag:/, '').trim());
    tagEls.forEach((node) => {
      if (tags.includes(node.dataset.normalizedValue)) node.classList.add('selected');
    });
  }

  /**
   * On key up search for substrings in the name content of the events
   */
  function setupSearchField() {
    const searchInput = $('.js-search-input');
    showEl(searchInput);
    const { searchAndFilter } = modules.events;
    searchInput.value = storage.load('searchTerm');
    searchInput.addEventListener(
      'input',
      _.debounce((keyEvt) => {
        const currentValue = keyEvt.target.value.trim();
        searchAndFilter(currentValue);
        markTagBasedOnSearchField(currentValue);
      }, 500)
    );
    searchInput.addEventListener('focus', (keyEvt) => keyEvt.target.select());
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

  // TAG SELECTOR
  // ============

  function setupTagSelector() {
    const STRIP_COLOR = true;
    const target = $('.js-clickable-tag-filter');
    const collectedValues = [];
    const collectedTags = [];
    // clone the tags from the dom
    $$('.genre.genre-or-tag').forEach((node) => {
      const row = node.closest('.js-event');
      // do not collect from expired event rows (it would be nicer to mark the
      // irrelevant tags, then we could style them, but that's not as simple as this)
      if (row.dataset.expired) return;
      const value = node.dataset.value;
      if (collectedValues.includes(value)) return;
      collectedValues.push(value);
      const clone = node.cloneNode(true);
      if (STRIP_COLOR) clone.style = '';
      clone.dataset.normalizedValue = value.replace(/\s/g, '-').toLocaleLowerCase();
      collectedTags.push({ value, node: clone });
    });
    collectedTags.sort((a, b) => a.value.localeCompare(b.value)).forEach((obj) => target.appendChild(obj.node));
    if (collectedTags.length <= 1) hideEl(target);
    const searchInput = $('.js-search-input');
    target.addEventListener('click', (clickEvt) => {
      const el = clickEvt.target;
      if (el.classList.contains('js-event-genre')) {
        const tag = String(el.dataset.value).toLocaleLowerCase().replace(/\s/g, '-');
        const searchValue = searchInput.value.trim();
        const tagCount = (searchValue.match(/tag:/g) || []).length;
        const hasTagAlready = searchValue.includes(`tag:${tag}`);
        if (hasTagAlready) {
          searchInput.value = (searchValue + ' ').replace(`tag:${tag}`, ` `);
        } else {
          // zero or more and it's not already there: add it - only one: replace
          if (tagCount === 0 || tagCount > 1) searchInput.value = `${searchValue} tag:${tag}`.trim();
          if (tagCount === 1) searchInput.value = (searchValue + ' ').replace(/tag:[^\s]*\s/, `tag:${tag} `);
        }
        searchInput.value = searchInput.value.trim().replace(/\s+/g, ' '); // fix spaces we may have introduced
        triggerInputEvent(searchInput);
      }
    });
  }

  // DATE SELECTOR
  // =============

  function setupDateSelector() {
    const changeDate = (clickEvt) => {
      const searchInput = $('.js-search-input');
      const searchValue = searchInput.value.trim();
      const target = clickEvt.target;
      const value = target.dataset.value;
      const today = (url.queryString.parse() || {}).currentDate || null;
      const dateText = date.getFlexibleDateRange(today, value);
      searchInput.value = (' ' + searchValue + ' ')
        .replace(/ /g, '  ')
        .replace(/ \d{4}-\d{2}-\d{2}\*\d{4}-\d{2}-\d{2} /g, ' ') // double date
        .replace(/ \d{4}-\d{2}-\d{2} /g, ' ') // single date
        .replace(/\s+/g, ' ') // leftover spaces
        .trim();
      searchInput.value = (searchInput.value + ' ' + dateText).trim();
      triggerInputEvent(searchInput);
    };
    $$('.js-mod-date').forEach((el) => el.addEventListener('click', changeDate));
  }

  const setupControls = () => {
    setupSearchField();
    setupThemeSwitcher();
    setupTagSelector();
    setupDateSelector();
    addModalCloseHandler();
    addModalOpener();
    triggerInputEvent($('.js-search-input'));
  };

  return { setup: setupControls };
})();
