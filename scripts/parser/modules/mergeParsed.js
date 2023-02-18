const path = require('path');
const fs = require('fs');
const config = require('./config');
const slugify = require('../utils/string/slugify');
const log = require('./log');
const chalk = require('chalk');
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
    } else {
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
      }
    }
    if (!placeFound) {
      log.warning(
        `Could not find a matching ${chalk.red('place')} for event #${event.rowIdx}:\n` +
          `venue: ${event.venue}\nvenueAddress: ${event.venueAddress}`
      );
      event.__venue = event.venue; // backup the old values
      event.__venueAddress = event.venueAddress;
    }

    // link to performers
    const performerSlug = slugify(event.performer);
    let performerFound = false;
    if (performersByNameMap[performerSlug]) {
      event.performer = performersByNameMap[performerSlug];
      performerFound = true;
    }
    if (!performerFound) {
      log.warning(
        `Could not find a matching ${chalk.red('performer')} for event #${event.rowIdx}:\n` +
          `venue: ${event.venue}\nperformer: ${event.performer}`
      );
      event.__performer = event.performer;
      delete event.performer; // delete only if we failed to find it, unlike with venues
    }

    // remove some leftovers
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
  return ret;
};
