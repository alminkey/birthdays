import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function parseBirthday(date) {
  return dayjs(date, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD.MM.YYYY'], true);
}

export function getNextBirthdayOccurrence(date, today = dayjs()) {
  const birthDate = parseBirthday(date);
  if (!birthDate.isValid()) {
    return today;
  }
  let upcoming = birthDate.year(today.year());
  if (upcoming.isBefore(today, 'day')) {
    upcoming = upcoming.add(1, 'year');
  }
  return upcoming;
}

export function getDaysUntil(date, today = dayjs()) {
  const upcoming = getNextBirthdayOccurrence(date, today);
  return upcoming.diff(today.startOf('day'), 'day');
}

export function sortBirthdaysByNextOccurrence(birthdays) {
  return [...birthdays].sort((a, b) => {
    const diff = getNextBirthdayOccurrence(a.date).valueOf() - getNextBirthdayOccurrence(b.date).valueOf();
    if (diff !== 0) {
      return diff;
    }
    return a.name.localeCompare(b.name);
  });
}

export function formatDisplayDate(date, format = 'MMM D, YYYY') {
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : '';
}

export function formatDisplayTime(date, format = 'MMM D, YYYY h:mm A') {
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : '';
}

export function formatCountdown(days) {
  if (days < 0) {
    return 'Past celebration';
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `${days} days left`;
}

export function getUpcomingAge(date, today = dayjs()) {
  const birthDate = parseBirthday(date);
  if (!birthDate.isValid()) {
    return null;
  }
  const next = getNextBirthdayOccurrence(date, today);
  return next.year() - birthDate.year();
}

export function getCurrentAge(date, today = dayjs()) {
  const birthDate = parseBirthday(date);
  if (!birthDate.isValid()) {
    return null;
  }
  let age = today.year() - birthDate.year();
  const thisYearsBirthday = birthDate.year(today.year());
  if (today.isBefore(thisYearsBirthday, 'day')) {
    age -= 1;
  }
  return age;
}
