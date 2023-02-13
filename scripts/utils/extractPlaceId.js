const slugify = require('./string/slugify');

module.exports = function extractPlaceId(fbEventUrl = '', url = '') {
  let urlId = '';
  // create "urlId" from the facebook event url
  if (typeof fbEventUrl === 'string') {
    urlId = fbEventUrl
      .trim()
      .replace(/.*facebook\.com\//, '')
      .replace(/\/.*/, '')
      .replace(/\?.*/, '');
    if (['profile.php'].includes(urlId)) {
      urlId = null;
    }
  }
  // nope, we failed, let's try the domain
  if (!urlId && url) {
    const domain = url
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*/, '')
      .split('.')[0];
    urlId = domain;
  }
  return slugify(urlId);
};
