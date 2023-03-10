(() => {
  const dayjs = window.dayjs;
  const { modules } = window.pv;
  const { log, url, dom } = window.pv.utils;

  let currentDate = dayjs().format('YYYY-MM-DD');

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

  // --------------------------------------------------------------------------

  (function main() {
    const setupUiControls = modules.controls.setup;
    const { collectEventsFromDom, getSearchFromUrl } = modules.events;

    // mark window title for development
    if (window.location.hostname === 'localhost') {
      dom.$('title').innerText += ' (dev)';
    }

    // get search term of url if possible, then remove it from the url with a reload
    const copiedSearchFromUrl = getSearchFromUrl();
    if (copiedSearchFromUrl) {
      url.forceReload('shared');
      return;
    }

    const hideDatesInThePast = () => modules.events.hideDatesInThePast(currentDate);
    useUrlDebugOptions();
    collectEventsFromDom();
    hideDatesInThePast();
    setInterval(hideDatesInThePast, 1000 * 60 * 60 * 12); //check every 12 hours for old events
    setupUiControls();
  })();
})();
