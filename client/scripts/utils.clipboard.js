window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.clipboard = (() => {
  const { log } = window.pv.utils;

  // in 2023 copying to the clipboard is still a huge pain,
  // but probably in a couple of decades we're sort it out somehow...
  function promptFallback(text) {
    window.prompt('Vágólapra másolhatja: ctrl+c és enter', text);
  }

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
    let successful = false;
    try {
      successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      log.info('copy to clipboard fallback command was ' + msg);
    } catch (err) {
      log.error('copy to clipboard fallback failed', err);
    }
    document.body.removeChild(textArea);
    return successful;
  }

  function copy(text) {
    let success = false;
    if (!navigator.clipboard) {
      success = fallbackCopyTextToClipboard(text);
      if (!success) promptFallback(text);
    } else {
      navigator.clipboard.writeText(text).then(
        () => {
          log.info('copy to clipboard async mode was successful');
        },
        (err) => {
          log.error('copy to clipboard async copy failed', err);
          promptFallback(text);
        }
      );
    }
  }

  return {
    copy,
  };
})();
