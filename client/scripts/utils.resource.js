window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.resource = (() => {
  // an old wrapper around david walsh's resource downloader
  function getBasicDownloaders() {
    const BODY = 'body';
    const HEAD = 'head';

    const tagToUrlAttribute = { script: 'src', link: 'href', img: 'src' };

    const _load = (tag) => {
      return (url, attributes = {}) => {
        return new Promise((resolve, reject) => {
          const { parent, attributes: tagAttributes } = tagToTagDetailsFuncs[tag](url, attributes);
          if (isAlreadyLoaded(tag, tagAttributes)) return resolve(url);
          const element = document.createElement(tag);
          element.onload = () => resolve(url);
          element.onerror = () => reject(url);
          Object.keys(tagAttributes).forEach((name) => element.setAttribute(name, tagAttributes[name]));
          document[parent].appendChild(element);
        });
      };
    };

    const isAlreadyLoaded = (tag, attributes) => {
      const urlAttribute = tagToUrlAttribute[tag];
      const url = attributes[urlAttribute];
      const rel = attributes.rel || '';
      return Boolean(document.querySelector(`${tag}[${urlAttribute}="${url}"]${rel ? `[rel="${rel}"]` : ''}`));
    };

    const getScriptTagDetails = (url, attributes) => {
      const hasNoAsyncOrDefer = !('async' in attributes || 'defer' in attributes);
      return {
        parent: BODY,
        attributes: { src: url, ...(hasNoAsyncOrDefer && { async: '' }), ...attributes },
      };
    };

    const getLinkTagDetails = (url, attributes) => {
      return {
        parent: HEAD,
        attributes: { href: url, type: 'text/css', rel: 'stylesheet', ...attributes },
      };
    };

    const getImgTagDetails = (url, attributes) => {
      return { parent: BODY, attributes: { src: url, ...attributes } };
    };

    const tagToTagDetailsFuncs = { script: getScriptTagDetails, link: getLinkTagDetails, img: getImgTagDetails };

    return {
      css: _load('link'),
      js: _load('script'),
      img: _load('img'),
    };
  }

  return {
    download: getBasicDownloaders(),
  };
})();
