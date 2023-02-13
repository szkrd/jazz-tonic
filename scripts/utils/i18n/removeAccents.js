/**
 * Convert local characters to their fallback ascii counterpart.
 */
module.exports = function removeAccents(text = '') {
  return text
    .replaceAll('ć', 'c')
    .replaceAll('ñ', 'n')
    .replaceAll('é', 'e')
    .replaceAll('ö', 'o')
    .replaceAll('ú', 'u')
    .replaceAll('ü', 'u')
    .replaceAll('ó', 'o')
    .replaceAll('ø', 'o')
    .replaceAll('ő', 'o')
    .replaceAll('ű', 'u')
    .replaceAll('á', 'a')
    .replaceAll('à', 'a')
    .replaceAll('í', 'i')
    .replaceAll('ï', 'i')
    .replaceAll('Ñ', 'N')
    .replaceAll('Ú', 'U')
    .replaceAll('Ü', 'U')
    .replaceAll('Ö', 'O')
    .replaceAll('Ø', 'O')
    .replaceAll('Ó', 'O')
    .replaceAll('Ő', 'O')
    .replaceAll('Ű', 'U')
    .replaceAll('É', 'E')
    .replaceAll('À', 'A')
    .replaceAll('Á', 'A')
    .replaceAll('Ć', 'C')
    .replaceAll('Ï', 'I')
    .replaceAll('Í', 'I');
};
