const { last, escapeRegExp } = require('lodash');
const dayjs = require('dayjs');
const utcPlugin = require('dayjs/plugin/utc');
const timezonePlugin = require('dayjs/plugin/timezone');
const newRex = require('../regexp/newRex');

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

const DEBUG = false;
const LOCAL_TZ = 'Europe/Budapest';
const RANGE_MARKER = ' – ';
const TODAY = 'TODAY';
const TOMORROW = 'TOMORROW';
const THIS = 'THIS';
const SHORT_DAYS = ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SHORT_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];
const OUT_FORMAT = 'YYYY-MM-DDTHH:mm';

const error = (...args) => {
  const date = args.shift();
  console.info(`[parseDate] "${date}"`, ...args);
  return null;
};

const splitToRange = (text) => text.trim().replace(RANGE_MARKER.trim(), '-').replace(/\s/g, '').split('-');

/**
 * Parses fb date. Returns ISOish strings on success or null on failure:
 * `{ startDate, endDate }`
 * @param text "MONDAY FROM 19:00-20:30"
 * @param parsedAt "2023-02-10"
 * @param raw  returns just a string, instead of an object
 */
module.exports = function parseDate(text, parsedAt, raw = false) {
  const origText = text;
  text = String(text).toUpperCase().trim().replace(/\s+/g, ' ');
  // from-to pairs we need to split and feed into the function one by one
  if (text.includes(RANGE_MARKER)) {
    const parts = text.split(RANGE_MARKER);
    if (parts.length !== 2) {
      return error(utcOffset, 'invalid range split?');
    } else {
      return {
        startDate: parseDate(parts[0], parsedAt, true),
        endDate: parseDate(parts[1], parsedAt, true),
      };
    }
  }
  // we can safely cut off the THIS DAY prefix, we will try to find the closest day anyway
  if (text.startsWith(THIS + ' ')) {
    text = text.replace(new RegExp('^' + escapeRegExp(`${THIS} `)), '').trim();
  }
  // handle utc data (event was added probably in another timezone?)
  let utcOffset = 0;
  if (/UTC[+-]\d+/.test(text)) {
    const matches = text.match(/UTC([+-]\d+)/);
    if (matches.length >= 2) {
      utcOffset = parseInt(matches[1], 10);
      if (isNaN(utcOffset)) {
        return error(origText, 'invalid UTC offset?');
      }
      text = text.replace(/UTC[+-]\d+/, '').trim();
    }
  }
  // cut off the "and X more" suffix
  if (/AND \d+ MORE/.test(text)) {
    text = text.replace(/AND \d+ MORE/, '');
  }
  let startDate;
  let endDate;
  let done = false;
  // TODAY AT 12:00 or TOMORROW AT 16:30, and their FROM short range variant
  if (!done && (text.startsWith(TODAY) || text.startsWith(TOMORROW))) {
    const parts = text.split(' ');
    const isTomorrow = text.startsWith(TOMORROW);
    if (parts[1] === 'AT') {
      // toISO would take the timezone into account (12:00 -> 11:00)
      startDate = dayjs(parsedAt + 'T' + parts[2]);
      if (isTomorrow) startDate = startDate.add(1, 'day');
    } else if (parts[1] === 'FROM') {
      const times = splitToRange(parts[2]);
      if (times.length !== 2) {
        return error(origText, 'invalid from marker for time?');
      }
      startDate = dayjs(parsedAt + 'T' + times[0]);
      endDate = dayjs(parsedAt + 'T' + times[1]);
      if (isTomorrow) {
        startDate = startDate.add(1, 'day');
        endDate = endDate.add(1, 'day');
      }
    } else {
      return error(origText, 'invalid from/at marker?');
    }
    done = true;
  }
  // normalize month names (short to normal)
  SHORT_MONTHS.forEach((sMon, idx) => {
    text = text.replace(newRex(` ${sMon} `, 'g'), ` ${MONTHS[idx]} `);
  });
  // if we have a month name preceded by a number, then that's a date
  // and we can ignore the extra day info, like in "MONDAY, 22 MAY" -> "22 MAY"
  MONTHS.forEach((mon) => {
    const idx = text.indexOf(` ${mon} `); // position of " JULY " for example (in "... 14 JULY ")
    if (idx > -1) {
      const trunc = text.substring(0, idx);
      if (/ \d+$/.test(trunc)) {
        const numPart = last(trunc.split(' '));
        text = text.substring(idx - numPart.length);
      }
    }
  });
  // normalize day names (short to normal)
  SHORT_DAYS.forEach((day, idx) => {
    text = text.replace(`${day}, `, DAYS[idx] + ' ');
  });
  // WEDNESDAY AT 19:00 at and from pairs
  for (let idx = 1; idx < 8; idx++) {
    const futureDay = dayjs(parsedAt).add(idx, 'days').format('dddd').toUpperCase();
    if (!done && text.startsWith(futureDay + ' ')) {
      done = true;
      const dayOffset = idx;
      let parts = text.split(' '); // 0 day name 1 AT 2 time
      if (parts[1] === 'AT') {
        startDate = dayjs(parsedAt + 'T' + parts[2]).add(dayOffset, 'days');
      } else if (parts[1] === 'FROM') {
        const times = splitToRange(parts[2]);
        startDate = dayjs(parsedAt + 'T' + times[0]).add(dayOffset, 'days');
        endDate = dayjs(parsedAt + 'T' + times[1]).add(dayOffset, 'days');
      }
    }
  }

  // hopefully at this point we have something like this: 14 MAR 2023 AT 18:00
  if (!done && /^\d/.test(text)) {
    const parts = text.split(' ');
    let day = 0;
    let month = 0;
    let year = parseInt(parsedAt.substring(0, 4), 10);
    let time = [];
    for (let idx = 0; idx < parts.length; idx++) {
      const part = parts[idx];
      if (idx === 0 && /^\d+$/.test(part)) day = parseInt(part, 10);
      if (idx > 0 && /^\d{4}$/.test(part)) year = parseInt(part, 10);
      if (MONTHS.includes(part)) month = MONTHS.indexOf(part) + 1;
      if (['AT', 'FROM'].includes(part)) {
        if (part === 'AT') time.push(parts[idx + 1]);
        if (part === 'FROM') time = splitToRange(parts[idx + 1]);
        break;
      }
    }
    if (day && month && year && time) {
      done = true;
      startDate = dayjs(`${year}-${month}-${day}T${time[0]}`);
      if (time.length === 2) endDate = dayjs(`${year}-${month}-${day}T${time[1]}`);
    }
  }

  if (startDate && utcOffset) {
    const localTzHours = (dayjs.tz(startDate, LOCAL_TZ).toDate().getTimezoneOffset() * -1) / 60;
    if (utcOffset !== localTzHours) {
      error(origText, `possible timezone mismatch for ${LOCAL_TZ}? Values: ${utcOffset} vs ${localTzHours}`);
    }
  }

  // render dayjs values to strings
  if (startDate && typeof startDate === 'object') startDate = startDate.format(OUT_FORMAT);
  if (endDate && typeof endDate === 'object') endDate = endDate.format(OUT_FORMAT);

  if (DEBUG) console.log(`DATE PARSING OUTPUT NORMALIZATION: "${origText}" -> "${text}"`);

  // finally
  if (raw) return startDate;
  const ret = { startDate, endDate };
  if (!endDate) delete ret.endDate;
  return ret;
};
