module.exports = function splitGenreTags(text) {
  if (text === '#REF!') text = ''; // good old excel broken reference
  if (text && typeof text === 'string') {
    return text
      .split(',')
      .map((tag) => tag.replace(/\s+/g, ' ').trim().toLocaleLowerCase())
      .filter((tag) => tag);
  }
  return [];
};
