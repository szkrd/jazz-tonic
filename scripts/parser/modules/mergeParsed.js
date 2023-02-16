const path = require('path');
const fs = require('fs');
const config = require('./config');
const slugify = require('../utils/string/slugify');

module.exports = function mergeParsed(placesData, performersData, eventsData) {
  const fileName = path.join(config.dataDir, 'main.json');
  console.info('Merging places + performers + events...');
  const merged = [];
  eventsData.forEach((event) => {
    // console.log('TODO >>>', event.rowIdx, slugify(event.venueAddress));
  });
  fs.writeFileSync(fileName, JSON.stringify(merged, null, 2), 'utf-8');
  console.info(`Merging done.\nCombined ${merged.length} rows.`);
  return merged;
};
