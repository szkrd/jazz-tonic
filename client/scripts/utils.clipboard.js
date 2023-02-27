window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.clipboard = (() => {
  const { log } = window.pv.utils;

  // old (with fake dom node) method copied from https://stackoverflow.com/a/30810322
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      log.info('copy to clipboard fallback command was ' + msg);
    } catch (err) {
      log.error('copy to clipboard fallback failed', err);
    }
    document.body.removeChild(textArea);
  }

  function copy(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        log.info('copy to clipboard async mode was successful');
      },
      function (err) {
        log.error('copy to clipboard async copy failed', err);
      }
    );
  }

  return {
    copy,
  };
})();
