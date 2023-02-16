module.exports = function splitGenreTags(text) {
  if (text && typeof text === 'string') {
    return text
      .split(',')
      .map((tag) => tag.replace(/\s+/g, ' ').trim().toLocaleLowerCase())
      .filter((tag) => tag);
  }
  return [];
};
