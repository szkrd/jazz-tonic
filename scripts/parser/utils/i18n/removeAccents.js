/**
 * Convert local characters to their fallback ascii counterpart.
 * (this can be used for slugification, but not for a band's name for example, since that is a pronoun)
 */
module.exports = function removeAccents(text = '') {
  return text
    .replaceAll('ı', 'i') // lower dotless I (there's no upper), used in Azerbaijani, Crimean Tatar, Gagauz, Kazakh, Tatar, Turkish
    .replaceAll('ć', 'c')
    .replaceAll('č', 'c')
    .replaceAll('ñ', 'n')
    .replaceAll('é', 'e')
    .replaceAll('è', 'e')
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
    .replaceAll('È', 'E')
    .replaceAll('É', 'E')
    .replaceAll('À', 'A')
    .replaceAll('Á', 'A')
    .replaceAll('Ć', 'C')
    .replaceAll('Č', 'C')
    .replaceAll('Ï', 'I')
    .replaceAll('Í', 'I');
};
