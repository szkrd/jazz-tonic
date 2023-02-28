const escapeHtml = require('./escapeHtml');

function addHtmlLineBreaks(text = '') {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br>\n');
}

module.exports = function textToHtml(text = '') {
  text = escapeHtml(text);
  text = addHtmlLineBreaks(text);

  // url sticking to a word
  text = text.replace(/([a-zA-Z])(https:\/)/g, '$1 $2');

  // this may capture broken links as well, where there is no space after the url
  // an example:
  // "János dobhttps://www.facebook.com/100063655596766/videos/1157545177979537/Belépő/Entrance fee"
  // where in reality this should look like this:
  // "Sramkó János dob\nhttps://www.facebook.com/100063655596766/videos/1157545177979537/\nBelépő/Entrance fee"
  // text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
  return text;
};
