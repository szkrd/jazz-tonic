(() => {
  // eslint-disable-next-line no-undef
  const dayjs = window.dayjs;
  const { log, i18n, url } = window.pv.utils;
  const { $, $$, showEl, hideEl } = window.pv.utils.dom;

  const events = [];
  let currentDate = dayjs().format('YYYY-MM-DD');
  const elements = {
    searchInput: $('.js-search-input'),
    noEventsMessage: $('.js-no-events-message'),
  };

  // Add global callback for event insertion (using poor man's jsonp callback)
  window.pv.addEvent = (data) => {
    const existingEventIdx = events.findIndex((event) => event.rowIdx === data.rowIdx);
    if (existingEventIdx > -1) events[existingEventIdx] = data;
    else events.push(data);
  };

  const showEvent = (event) => showEl($(`#event-${event.rowIdx}`));
  const hideEvent = (event) => hideEl($(`#event-${event.rowIdx}`));

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
   * Checks the events array and if an event has expired, marks it and hides it in the dom
   */
  function hideDatesInThePast() {
    let hiddenEventCount = 0;
    events.forEach((event) => {
      if (dayjs(event.startDateTimeNumber).isBefore(dayjs(currentDate))) {
        hideEvent(event);
        event.expired = true;
        hiddenEventCount++;
      }
    });
    if (hiddenEventCount > 0 && hiddenEventCount < events.length) {
      log.info(`Hiding ${hiddenEventCount} events because those are in the past.`);
    }
    if (hiddenEventCount === events.length) {
      log.info(`All the events are hidden, because all of them are marked as expired.`);
      showEl(elements.noEventsMessage);
    }
  }

  /**
   * Collect events in roughly the same format as the template's dataset uses
   */
  function collectEventsFromDom() {
    $$('.js-event').forEach((el) => {
      const expired = false; // will be handled later
      const rowIdx = parseInt(el.id.replace(/^event-/, ''), 10);
      const name = $('.js-event-name', el).innerText.trim();
      const startDateTimeNumber = parseInt($('.js-event-date', el).dataset.date, 10);
      const startDateTimeFormatted = $('.js-event-date', el).innerText.trim();
      const genre = $('.js-event-genre', el).innerText.trim();
      const tags = $$('.js-event-tag', el).map((tagEl) => tagEl.innerText.trim());
      const place = {
        name: $('.js-event-place-name', el).innerText.trim(),
        rowIdx: parseInt($('.js-event-place-name', el).id.replace(/^event-place-/, ''), 10),
      };
      events.push({ rowIdx, name, startDateTimeNumber, startDateTimeFormatted, genre, tags, place, expired });
    });
    if (events.length === 0) showEl(elements.noEventsMessage);
    log.info('Parsed events:', events);
  }

  /**
   * On key up search for substrings in the name content of the events
   */
  function manageSearchField() {
    showEl(elements.searchInput);

    // search for case and accent insensitive susbtrings
    const matcher = (value, needle) => {
      if (value === '' || value === undefined) return false;
      if (Array.isArray(value)) return value.some((singleValue) => matcher(singleValue, needle));
      needle = needle.toLocaleLowerCase();
      const loEventValue = value.toLocaleLowerCase();
      return loEventValue.includes(needle) || i18n.removeAccents(loEventValue).includes(needle);
    };

    // search for text in the list of events, update their dom element's visibility
    const searchAndFilter = (text) => {
      if (!text) return events.filter((event) => !event.expired).forEach(showEvent); // arrays are OR based
      if (text) events.forEach(hideEvent);
      events
        .filter((event) => !event.expired)
        .filter(
          (event) =>
            matcher(event.name, text) ||
            matcher(event.genre, text) ||
            matcher(event.tags, text) ||
            matcher(event.place.name, text)
        )
        .forEach(showEvent);
    };

    elements.searchInput.addEventListener('keyup', (keyEvt) => searchAndFilter(keyEvt.target.value.trim()));
    searchAndFilter(elements.searchInput.value.trim());
  }

  // --------------------------------------------------------------------------

  (function main() {
    useUrlDebugOptions();
    collectEventsFromDom();
    hideDatesInThePast();
    setInterval(hideDatesInThePast, 1000 * 60 * 60 * 12); //check every 12 hours for old events
    manageSearchField();
  })();
})();
