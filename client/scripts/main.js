(() => {
  const { log, string } = window.pv;
  const { $, $$, showEl, hideEl } = window.pv.dom;

  const events = [];
  const elements = {
    searchInput: $('.js-search-input'),
  };

  // Add global callback for event insertion (using poor man's jsonp callback)
  window.pv.addEvent = (data) => {
    const existingEventIdx = events.findIndex((event) => event.rowIdx === data.rowIdx);
    if (existingEventIdx > -1) events[existingEventIdx] = data;
    else events.push(data);
  };

  /**
   * Collect events in roughly the same format as the template's dataset uses
   */
  function collectEventsFromDom() {
    $$('.js-event').forEach((el) => {
      const rowIdx = parseInt(el.id.replace(/^event-/, ''), 10);
      const name = $('.js-event-name', el).innerText.trim();
      const startDateTimeNumber = parseInt($('.js-event-date', el).dataset.date, 10);
      const startDateTimeFormatted = $('.js-event-date', el).innerText.trim();
      const genre = $('.js-event-genre', el).innerText.trim();
      const tags = $$('.js-event-tag', el).map((tagEl) => tagEl.innerText.trim());
      const place = {
        name: $('.js-event-place-name').innerText.trim(),
        rowIdx: parseInt($('.js-event-place-name').id.replace(/^event-place-/, ''), 10),
      };
      events.push({ rowIdx, name, startDateTimeNumber, startDateTimeFormatted, genre, tags, place });
    });
    log.info('Parsed events:', events);
  }

  const showEvent = (event) => showEl($(`#event-${event.rowIdx}`));
  const hideEvent = (event) => hideEl($(`#event-${event.rowIdx}`));

  /**
   * On key up search for substrings in the name content of the events
   */
  function manageSearchField() {
    showEl(elements.searchInput);

    // search for case and accent insensitive susbtrings
    const matcher = (event, needle) => {
      const loEventName = event.name.toLocaleLowerCase();
      return loEventName.includes(needle) || string.removeAccents(loEventName).includes(needle);
    };

    // search for text in the list of events, update their dom element's visibility
    const searchAndFilter = (text) => {
      if (!text) return events.forEach(showEvent);
      if (text) events.forEach(hideEvent);
      events.filter((event) => matcher(event, text)).forEach(showEvent);
    };

    elements.searchInput.addEventListener('keyup', (keyEvt) => searchAndFilter(keyEvt.target.value.trim()));
    searchAndFilter(elements.searchInput.value.trim());
  }

  // --------------------------------------------------------------------------

  (function main() {
    collectEventsFromDom();
    manageSearchField();
  })();
})();
