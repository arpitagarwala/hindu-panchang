/**
 * Deterministic Date & Time Formatting and Validation Utilities
 * Prevents SSR / Client hydration mismatches and astronomy-engine invalid date exceptions.
 */

export function ensureValidDate(date?: Date | string | null): Date {
  if (!date) return new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? new Date() : d;
}

export function safeParseDateTime(dateStr?: string, timeStr?: string): Date {
  if (!dateStr) return new Date();
  const time = timeStr || '12:00';
  const parts = time.split(':');
  const hours = parseInt(parts[0] || '12', 10);
  const minutes = parseInt(parts[1] || '00', 10);
  const seconds = parseInt(parts[2] || '00', 10);

  const dateParts = dateStr.split('-');
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const d = new Date(
      year,
      month,
      day,
      isNaN(hours) ? 12 : hours,
      isNaN(minutes) ? 0 : minutes,
      isNaN(seconds) ? 0 : seconds
    );
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(`${dateStr}T${time}`);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function formatTime12(dateOrIso: Date | string): string {
  if (!dateOrIso) return '';
  const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hStr}:${mStr} ${ampm}`;
}

export function formatDateFormatted(dateOrIso: Date | string): string {
  if (!dateOrIso) return '';
  const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatMonthYear(dateOrIso: Date | string): string {
  if (!dateOrIso) return '';
  const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);
  return `${month} '${year}`;
}
