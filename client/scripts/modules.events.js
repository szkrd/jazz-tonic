window.pv = window.pv || {};
window.pv.modules = window.pv.modules || {};
window.pv.modules.events = (() => {
  const dayjs = window.dayjs;
  const { storage, i18n, log } = window.pv.utils;
  const { $, $$, showEl, hideEl, getInnerText } = window.pv.utils.dom;

  const events = [];

  // Add global callback for event insertion (using poor man's jsonp callback)
  window.pv.addEvent = (data) => {
    log.info(`Event #${data.rowIdx} data inserted via callback`);
    const existingEventIdx = events.findIndex((event) => event.rowIdx === data.rowIdx);
    if (existingEventIdx > -1) events[existingEventIdx] = data;
    else events.push(data);
  };

  const addEvent = (newEvent) => events.push(newEvent);
  const hasEvents = () => events.length > 0;
  const findEventByRowIdx = (id) => events.find((item) => item.rowIdx === id);

  /** Shows the dom element associated to this event */
  function showEvent(event) {
    showEl($(`#event-${event.rowIdx}`));
  }

  /** Hides the dom element associated to this event */
  function hideEvent(event) {
    hideEl($(`#event-${event.rowIdx}`));
  }

  function updateEventCountDisplay(items) {
    items = items || events.filter((event) => !event.expired);
    const countEl = $('.js-event-count');
    if (items.length === 0) {
      hideEl(countEl);
    } else {
      countEl.innerHTML = `${items.length} esemény`;
      showEl(countEl);
    }
  }

  // search for case and accent insensitive susbtrings
  const matcher = (value, needle) => {
    if (value === '' || value === undefined) return false;
    if (Array.isArray(value)) return value.some((singleValue) => matcher(singleValue, needle));
    needle = needle.toLocaleLowerCase();
    const loEventValue = value.toLocaleLowerCase();
    return loEventValue.includes(needle) || i18n.removeAccents(loEventValue).includes(needle);
  };
  matcher.all = (text) => (event) =>
    matcher(event.name, text) ||
    matcher(event.genre, text) ||
    matcher(event.tags, text) ||
    matcher(event.place.name, text);

  /**
   * Search in the events array for the text, shows and hides the result;
   * it tries to do an exact match first, then an AND operator based (for all words);
   * special prefixes:
   * `tag:jazz` - search this word (jazz) only in the genres (how about tags?)
   */
  function searchAndFilter(text) {
    storage.save('searchTerm', text);
    if (!text) {
      events.filter((event) => !event.expired).forEach(showEvent); // arrays are OR based
      updateEventCountDisplay();
      return;
    }
    if (text) events.forEach(hideEvent);
    text = text.trim().replace(/\s+/g, ' '); // though it's usually trimmed already
    let notExpiredEvents = events.filter((event) => !event.expired);

    // first we remove the tag:xxxx words and use them for prefiltering
    const words = text.split(' ');
    const tagWords = words.filter((word) => word.startsWith('tag:'));
    if (tagWords.length > 0) {
      let tags = [];
      tagWords.forEach((tagWord) => {
        tags.push(tagWord.replace(/^tag:/, ''));
        text = text.replace(tagWord, '').replace(/\s+/g, ' ').trim();
      });
      const normalizeTag = (tagName) => tagName.toLocaleLowerCase().replace(/\s/g, '-');
      tags = tags.map(normalizeTag);
      if (tags.length > 0) {
        notExpiredEvents = notExpiredEvents.filter((event) => tags.includes(normalizeTag(event.genre)));
      }
    }

    // we will do the same for dates (for their own format)
    const datePairs = [];
    text = (' ' + text + ' ').replace(/ /g, '  ').replace(/ \d{4}-\d{2}-\d{2}\*\d{4}-\d{2}-\d{2} /g, (found) => {
      datePairs.push(found.split('*').map((part) => part.trim())) * 0 || ' ';
      return ' ';
    });
    text = (' ' + text + ' ').replace(/ /g, '  ').replace(/ \d{4}-\d{2}-\d{2} /g, (found) => {
      return datePairs.push([found.trim(), found.trim()]) * 0 || ' ';
    });
    text = text.trim().replace(/\s+/g, ' ');
    if (datePairs.length > 0) {
      notExpiredEvents = notExpiredEvents.filter((event) => {
        const dStart = dayjs(dayjs(event.startDateTimeNumber).format('YYYY-MM-DD'));
        return datePairs.some(
          (currentDate) =>
            dStart.isSame(currentDate[0], 'day') || // same ast start
            dStart.isSame(currentDate[1], 'day') || // same as end
            (dStart.isAfter(currentDate[0], 'day') && dStart.isBefore(currentDate[1], 'day')) // between
        );
      });
    }

    const andOperator = ' '; // by default I usually use a comma, but the "real" user may not think like that...
    const matchEvent = matcher.all(text);
    let results = [];

    // triggers the AND operator (so "vocal jazz, modern jazz" means two searches internally)
    if (text.includes(andOperator)) {
      const parts = text.split(andOperator).map((part) => part.trim());
      const numberOfParts = parts.length;
      const foundEvents = []; // good matches will appear N times (N = number of text parts)
      parts.forEach((part) => {
        const partMatchEvent = matcher.all(part);
        notExpiredEvents.filter(partMatchEvent).map((event) => foundEvents.push(event));
      });
      // itereate through unique finds and count them in the foundEvents array, where they _may_ appear more than once
      [...new Set(foundEvents)].forEach((event) => {
        if (foundEvents.filter((item) => item === event).length === numberOfParts) results.push(event);
      });
    } // else results = notExpiredEvents.filter(matchEvent); ...

    // these are the exact matchers (like "bar baz" matches "foo bar baz qux", while "baz bar" won't)
    // if we have exact matches, then let's prefer those, if not, then swith to the fuzzy
    let strictResults = notExpiredEvents.filter(matchEvent);
    if (strictResults.length > 0) results = strictResults;

    results.forEach(showEvent);
    updateEventCountDisplay(results);
  }

  /**
   * Collect events in roughly the same format as the template's dataset uses
   */
  function collectEventsFromDom() {
    $$('.js-event').forEach((el) => {
      const expired = false; // will be handled later
      const rowIdx = parseInt(el.id.replace(/^event-/, ''), 10);
      const name = getInnerText('.js-event-name', el);
      const startDateTimeNumber = parseInt($('.js-event-date', el).dataset.date, 10);
      const startDateTimeFormatted = getInnerText('.js-event-date', el);
      const genre = getInnerText('.js-event-genre', el);
      const tags = $$('.js-event-tag', el).map((tagEl) => getInnerText(tagEl));
      const place = {
        name: getInnerText('.js-event-place-name', el),
        rowIdx: parseInt($('.js-event-place-name', el).id.replace(/^event-place-/, ''), 10),
      };
      addEvent({ rowIdx, name, startDateTimeNumber, startDateTimeFormatted, genre, tags, place, expired });
    });
    if (!hasEvents()) showEl($('.js-no-events-message'));
    log.info('Parsed events:', getEvents());
  }

  /**
   * Checks the events array and if an event has expired, marks it and hides it in the dom
   */
  function hideDatesInThePast(currentDate) {
    let hiddenEventCount = 0;
    events.forEach((event) => {
      if (dayjs(event.startDateTimeNumber).isBefore(dayjs(currentDate))) {
        hideEvent(event);
        $(`#event-${event.rowIdx}`).dataset.expired = event.expired = true;
        hiddenEventCount++;
      }
    });
    if (hiddenEventCount > 0 && hiddenEventCount < events.length) {
      log.info(`Hiding ${hiddenEventCount} event(s) because those are in the past.`);
    }
    if (hiddenEventCount === events.length) {
      log.info('All the events are hidden, because all of them are marked as expired.');
      showEl($('.js-no-events-message'));
    }
  }

  function getEvents() {
    return events;
  }

  return {
    showEvent,
    hideEvent,
    getEvents,
    addEvent,
    hasEvents,
    findEventByRowIdx,
    searchAndFilter,
    hideDatesInThePast,
    collectEventsFromDom,
  };
})();
