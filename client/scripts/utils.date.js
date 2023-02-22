window.pv = window.pv || {};
window.pv.utils = window.pv.utils || {};
window.pv.utils.date = (() => {
  const dayjs = window.dayjs;
  const f = (dayjsValue) => dayjsValue.format('YYYY-MM-DD');

  function getClosestDayByName(dDate, dayName) {
    for (let idx = 1; idx < 8; idx++) {
      const futureDay = dDate.add(idx, 'day');
      const futureDayName = futureDay.format('dddd');
      if (futureDayName === dayName) return f(futureDay);
    }
    return '';
  }

  function getFlexibleDateRange(today, name) {
    today = today || f(dayjs());
    const dToday = dayjs(today);
    const todayDayName = dToday.format('dddd');
    let dateFilterString = '';
    if (name === 'today') {
      dateFilterString = today;
    }
    if (name === 'tomorrow') {
      dateFilterString = f(dToday.add(1, 'day'));
    }
    if (name === 'weekend') {
      if (todayDayName === 'Saturday') {
        dateFilterString = [f(dToday), f(dToday.add(1, 'day'))];
      } else if (todayDayName === 'Sunday') {
        dateFilterString = f(dToday);
      } else {
        dateFilterString = [getClosestDayByName(dToday, 'Saturday'), getClosestDayByName(dToday, 'Sunday')];
      }
    }
    if (name === 'this-week') {
      if (todayDayName === 'Sunday') {
        dateFilterString = f(dToday);
      } else {
        dateFilterString = [f(dToday), getClosestDayByName(dToday, 'Sunday')];
      }
    }
    if (name === 'next-week') {
      const nextMonday = getClosestDayByName(dToday, 'Monday');
      dateFilterString = [nextMonday, getClosestDayByName(dayjs(nextMonday), 'Sunday')];
    }
    if (Array.isArray(dateFilterString)) dateFilterString = dateFilterString.join('*');
    return dateFilterString;
  }

  return {
    getFlexibleDateRange,
  };
})();
