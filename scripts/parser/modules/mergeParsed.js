const path = require('path');
const fs = require('fs');
const config = require('./config');
const slugify = require('../utils/string/slugify');
const log = require('./log');
const { uniq } = require('lodash');

const extraVenueMatchers = Object.values(config.extraVenueMatchers || {});
const getExtraVenueMatches = (text) => {
  const match = extraVenueMatchers.find((names) => names.includes(text));
  return (match ?? []).map((name) => slugify(name));
};

module.exports = function mergeParsed(placesData, performersData, eventsData) {
  const fileName = path.join(config.dataDir, 'main.json');
  console.info('Merging places + performers + events...');
  const merged = [...eventsData]; // should be a clone, this will still mutate the objects...

  // helper map objects
  const placesByNameMap = {};
  const placesByAddressMap = {};
  const performersByNameMap = {};
  placesData.forEach((place) => {
    placesByNameMap[slugify(place.name)] = place;
    placesByAddressMap[slugify(place.address)] = place;
  });
  performersData.forEach((performer) => (performersByNameMap[slugify(performer.name)] = performer));

  // temp array to collect tag ids (this is NOT stable, since we have no "real" tags sheet)
  // so this means that after a release/build it may change
  let genreIds = [];

  const missingPerformers = [];
  const missingPlaces = [];

  // process event rows
  merged.forEach((event) => {
    // link to places: first try with "venue"
    const venueSlug = slugify(event.venue);
    const venueAddressSlug = slugify(event.venueAddress);
    let placeFound = false;
    event.place = null;
    if (placesByNameMap[venueSlug]) {
      // match by name
      event.place = placesByNameMap[venueSlug];
      placeFound = true;
    } else if (placesByAddressMap[venueAddressSlug]) {
      // match by address
      event.place = placesByAddressMap[venueAddressSlug];
      placeFound = true;
    } else if (venueSlug) {
      // match by alternate names
      log.info(`Venue slug "${venueSlug}" had no matching pair in places, trying "extraVenueMatchers" from config.`);
      const extras = getExtraVenueMatches(venueSlug);
      if (extras) {
        for (let idx = 0; idx < extras.length; idx++) {
          const name = extras[idx];
          if (placesByNameMap[name]) {
            event.place = placesByNameMap[name];
            placeFound = true;
            break;
          }
        }
      } // else: missing venue name. so it goes (we already know about it).
    }
    if (!placeFound) {
      missingPlaces.push({ name: event.venue || '', rowIdx: event.rowIdx });
      event.place = { rowIdx: -1, name: event.venue || '', address: event.venueAddress || '' };
    }

    // link to performers (though we can have some really sparse data)
    const performerSlug = slugify(event.performer);
    let performerFound = false;
    if (performersByNameMap[performerSlug]) {
      event.performer = performersByNameMap[performerSlug];
      performerFound = true;
    }
    if (!performerFound) {
      missingPerformers.push({ name: event.performer || '', rowIdx: event.rowIdx });
      event.performer = { rowIdx: -1, name: event.performer || '' };
    }
    event.hasPerformer = !!event.performer.name;

    // remove some leftovers (venue is the old name, place is the good one)
    delete event.venue;
    delete event.venueAddress;

    // in case we want to have the tags and genres with ids
    genreIds.push(slugify(event.genre));
  });

  // add genreIds and colors
  genreIds = uniq(genreIds).sort();
  const colors = config.tagColors;
  merged.forEach((event) => {
    event.genreId = genreIds.indexOf(slugify(event.genre));
    const fg = colors[event.genreId % colors.length].fg;
    const bg = colors[event.genreId % colors.length].bg || fg + '50'; // fallback with alpha
    event.genreColor = fg;
    event.genreColorBg = bg;
  });
  if (colors.length < genreIds.length) log.info(`We have ${genreIds.length} genres, but only ${colors.length} colors.`);

  const user = process.env.USERNAME ?? process.env.USER ?? 'unknown';
  const ret = { events: merged, createdAt: new Date().toISOString(), user };
  fs.writeFileSync(fileName, JSON.stringify(ret, null, 2), 'utf-8');
  log.info(`Merging done.\nCollected ${genreIds.length} genres, combined ${merged.length} rows.`);
  if (missingPerformers.length > 0) {
    log.infoBuffer(`Performers not found in sheet "${config.xlsxTabPerformers}": ${missingPerformers.length}`, {
      missingPerformers,
    });
  }
  if (missingPlaces.length > 0) {
    log.infoBuffer(`Places not found in sheet "${config.xlsxTabPlaces}": ${missingPlaces.length}`, {
      missingPlaces,
    });
  }
  log.info(``);
  return ret;
};
