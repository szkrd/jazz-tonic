const fs = require('fs');
const xlsx = require('xlsx');
const parseFbDate = require('./utils/date/parseFbDate');
const extractUrlId = require('./utils/string/extractUrlId');
const slugify = require('./utils/string/slugify');
const xlsJsonToRows = require('./utils/xlsx/xlsJsonToRows');

module.exports = function parseEvents(fileName, parseDate, eventsXlsx, placesData) {
  console.info('Parsing events...');
  const json = xlsx.utils.sheet_to_json(eventsXlsx, { blankrows: false, defval: null });
  let rows = xlsJsonToRows(json);
  const unmatchedPlaceIds = [];
  rows.forEach((row) => {
    row.date = parseFbDate(row.date, parseDate);
    row.matchingPlaceRowIdx = -1;
    const placeId = row.placeId || '' || slugify(row.place);
    let matchingPlace = placesData.find((place) => placeId === place.id);
    const fbUrlId = extractUrlId(row.fbUpcomingEventsUrl);
    if (!matchingPlace) {
      matchingPlace = placesData.find((place) => place.ids.includes(fbUrlId));
    }
    if (!matchingPlace) {
      if (!unmatchedPlaceIds.includes(placeId)) unmatchedPlaceIds.push(placeId);
      console.error(`Could not find a matchin place for row #${row.rowIdx} at "${row.place}"`);
    }
    if (matchingPlace) {
      row.placeRowIdx = matchingPlace.rowIdx; // we can denormalize this later
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf-8');
  console.info(`Done. ${rows.length} rows.`);
  return rows;
};
