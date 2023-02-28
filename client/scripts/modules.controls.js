window.pv = window.pv || {};
window.pv.modules = window.pv.modules || {};
window.pv.modules.controls = (() => {
  const _ = window._;
  const { templates, modules } = window.pv;
  const { log, resource, storage, url, date, clipboard } = window.pv.utils;
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
    $('.js-modal-cover-layer').addEventListener('click', hideModal);
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
            setModalInnerContent(
              [
                '<p class="modal-error-message">',
                '  Hiba történt az esemény betöltésekor!',
                '  <br><br>',
                '  Lehet, hogy időközben frissültek az események, próbálja újratölteni az oldalt.',
                '</p>',
              ].join('')
            );
          });
      });
    });
  }

  // LOGO ROOT LINK
  // ==============

  function setupLogoRootLink() {
    const el = $('.js-home-link');
    el.addEventListener('click', () => {
      storage.save('searchTerm', '');
    });
  }

  // SHARE BUTTON
  // ============

  function setupShareButton() {
    const searchInput = $('.js-search-input');
    const button = $('.js-share-button');
    const dialog = $('.js-share-dialog');
    const textField = $('textarea', dialog);
    const copyButton = $('.js-copy-url-to-clipboard');
    // select all on textarea click
    textField.addEventListener('click', () => {
      textField.select();
    });
    // copy button
    copyButton.addEventListener('click', () => {
      clipboard.copy(textField.value);
      hideEl(dialog);
    });
    // on click copy the url with a query param to the clipboard
    button.addEventListener('click', () => {
      if (dialog.style.display !== 'none') {
        hideEl(dialog);
        return;
      }
      const searchValue = searchInput.value.trim();
      const newUrl = url.getBaseUrl() + '?q=' + encodeURIComponent(searchValue);
      showEl(dialog);
      textField.value = newUrl;
      textField.focus();
      textField.select();
    });
    // button should be disabled if there's nothing to copy
    searchInput.addEventListener('input', () => {
      const hasValue = searchInput.value.trim() !== '';
      button.disabled = !hasValue;
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
    setupShareButton();
    setupThemeSwitcher();
    setupTagSelector();
    setupDateSelector();
    addModalCloseHandler();
    addModalOpener();
    setupLogoRootLink();
    triggerInputEvent($('.js-search-input'));
  };

  return { setup: setupControls };
})();
