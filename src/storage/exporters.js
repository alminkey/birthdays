export function serializeToJson({ birthdays = [], events = [] }) {
  return JSON.stringify({ birthdays, events }, null, 2);
}

function quote(value) {
  if (value == null) {
    return '';
  }
  const escaped = String(value).replace(/"/g, '""');
  return "";
}

export function birthdaysToCsv(birthdays = []) {
  const header = ['Name', 'Date', 'Category', 'Gift idea', 'Notes', 'Notify offsets'];
  const rows = birthdays.map((item) => [
    quote(item.name),
    quote(item.date),
    quote(item.category ?? ''),
    quote(item.giftIdea ?? ''),
    quote(item.notes ?? ''),
    quote((item.notifyOffsets ?? []).join(' | ')),
  ].join(','));
  return [header.join(','), ...rows].join('\n');
}

export function eventsToCsv(events = []) {
  const header = ['Title', 'Datetime', 'Location', 'Notes', 'Notify offsets'];
  const rows = events.map((item) => [
    quote(item.title),
    quote(item.datetime),
    quote(item.location ?? ''),
    quote(item.notes ?? ''),
    quote((item.notifyOffsets ?? []).join(' | ')),
  ].join(','));
  return [header.join(','), ...rows].join('\n');
}
