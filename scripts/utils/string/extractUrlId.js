const slugify = require('./slugify');

/**
 * Extracts the name of company/place/venue from a url,
 * either hoping for a facebook object id or treating
 * the url as generic domain based one.
 */
module.exports = function extractUrlId(url = '') {
  let urlId = '';
  url = String(url || '');
  if (url.includes('facebook.com')) {
    // create "urlId" from the facebook event url
    urlId = url
      .trim()
      .replace(/.*facebook\.com\//, '')
      .replace(/\/.*/, '')
      .replace(/\?.*/, '');
    if (['profile.php'].includes(urlId)) {
      urlId = null;
    }
  } else {
    // nope, we failed, let's try the domain
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
