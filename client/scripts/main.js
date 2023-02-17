(() => {
  const log = window.pv.log;
  const { $, $$, show, hide } = window.pv.dom;

  const events = [];
  const elements = {
    searchInput: $('.js-search-input'),
  };

  // poor man's jsonp callback
  window.pv.addEvent = (data) => {
    const existingEventIdx = events.findIndex((event) => event.rowIdx === data.rowIdx);
    if (existingEventIdx > -1) events[existingEventIdx] = data;
    else events.push(data);
  };

  // collect events in roughly the same format as the template's dataset uses
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

  const showEvent = (rowIdx) => show($(`#event-${rowIdx}`));
  const hideEvent = (rowIdx) => hide($(`#event-${rowIdx}`));

  function manageSearchField() {
    show(elements.searchInput);
    elements.searchInput.addEventListener('keyup', (event) => {
      const text = event.target.value.trim();
      if (!text) return events.forEach((event) => showEvent(event.rowIdx));
      if (text) events.forEach((event) => hideEvent(event.rowIdx));
      events
        .filter((event) => event.name.toLocaleLowerCase().includes(text))
        .forEach((event) => showEvent(event.rowIdx));
    });
  }

  function main() {
    collectEventsFromDom();
    manageSearchField();
  }

  // ---
  main();
})();
