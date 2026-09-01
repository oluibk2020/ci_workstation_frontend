/**
 * Mirrors the backend's helper/businessDate.js exactly (same weekday
 * names, same UTC-based iteration) so the booking UI can give immediate
 * feedback — e.g. graying out a non-operating day — without a round
 * trip. The backend remains the final authority; this is UX only.
 */

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function getWeekdayName(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  return WEEKDAYS[date.getUTCDay()];
}

export function isOperatingDay(dateString, operatingDays) {
  return operatingDays.includes(getWeekdayName(dateString));
}

export function getOperatingDates({ startDate, endDate, operatingDays }) {
  const dates = [];
  const current = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (current <= end) {
    const iso = current.toISOString().slice(0, 10);
    if (isOperatingDay(iso, operatingDays)) {
      dates.push(iso);
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateLabel(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
