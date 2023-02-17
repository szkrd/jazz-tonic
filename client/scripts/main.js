(() => {
  const log = window.pv.log;
  const { $, $$, show } = window.pv.dom;

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

  function main() {
    show(elements.searchInput);
    collectEventsFromDom();
  }

  // ---
  main();
})();
