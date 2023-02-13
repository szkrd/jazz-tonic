/**
 * Convert local characters to their fallback ascii counterpart.
 */
module.exports = function removeAccents(text = '') {
  return text
    .replaceAll('ñ', 'n')
    .replaceAll('é', 'e')
    .replaceAll('ö', 'o')
    .replaceAll('ú', 'u')
    .replaceAll('ü', 'u')
    .replaceAll('ó', 'o')
    .replaceAll('ő', 'o')
    .replaceAll('ű', 'u')
    .replaceAll('á', 'a')
    .replaceAll('í', 'i')
    .replaceAll('Ñ', 'N')
    .replaceAll('Ú', 'U')
    .replaceAll('Ü', 'U')
    .replaceAll('Ö', 'O')
    .replaceAll('Ó', 'O')
    .replaceAll('Ő', 'O')
    .replaceAll('Ű', 'U')
    .replaceAll('É', 'E')
    .replaceAll('Á', 'A')
    .replaceAll('Í', 'I');
};
