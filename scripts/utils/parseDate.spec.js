const parseDate = require('./parseDate');

describe('parseDate', () => {
  it('should parse dates', () => {
    let val = '';

    // today exact
    val = parseDate('TODAY AT 12:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-13T12:00' });

    // tomorrow exact
    val = parseDate('TOMORROW AT 16:30', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-14T16:30' });

    // just the upcoming day (short, full, range)
    val = parseDate('WED, AT 19:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-15T19:00' });
    val = parseDate('WEDNESDAY AT 19:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-15T19:00' });
    val = parseDate('WEDNESDAY FROM 19:00-22:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-15T19:00', endDate: '2023-02-15T22:00' });

    // short and close range
    val = parseDate('TOMORROW FROM 20:30-22:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-14T20:30', endDate: '2023-02-14T22:00' });

    // "and X more" suffix
    val = parseDate('TUE, 14 MAR AT 18:00 AND 1 MORE', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-03-14T18:00' });

    // curious case of UTC offset
    val = parseDate('SAT, 18 FEB AT 23:00 UTC+01', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-18T23:00' });

    val = parseDate('TOMORROW AT 16:30', '2023-02-10');
    expect(val).toEqual({ startDate: '2023-02-11T16:30' });

    val = parseDate('TOMORROW AT 20:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-14T20:00' });

    val = parseDate('THIS WEDNESDAY AT 20:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-15T20:00' });

    val = parseDate('THIS FRIDAY AT 19:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-17T19:00' });

    // without THIS
    val = parseDate('SUNDAY AT 19:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-19T19:00' });

    // exact date, with short day name first
    val = parseDate('TUES, 21 FEB AT 20:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-21T20:00' });

    // with year!
    val = parseDate('WEDNESDAY, 22 FEBRUARY 2023 FROM 20:00-23:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-22T20:00', endDate: '2023-02-22T23:00' });

    // long range
    val = parseDate('13 JUL AT 12:00 – 16 JUL AT 01:59', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-07-13T12:00', endDate: '2023-07-16T01:59' });

    // random cases from latest raw spreadsheet
    // -----------------------------------------------

    val = parseDate('FRIDAY, 28 APRIL 2023 FROM 19:00-23:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-04-28T19:00', endDate: '2023-04-28T23:00' });

    val = parseDate('SATURDAY, 18 FEBRUARY 2023 FROM 15:00-19:00 UTC+01', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-18T15:00', endDate: '2023-02-18T19:00' });

    val = parseDate('FRIDAY, 10 MARCH 2023 FROM 19:30-21:15', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-03-10T19:30', endDate: '2023-03-10T21:15' });

    val = parseDate('17 FEB AT 22:00 – 18 FEB AT 08:00', '2023-02-13');
    expect(val).toEqual({ startDate: '2023-02-17T22:00', endDate: '2023-02-18T08:00' });
  });
});
