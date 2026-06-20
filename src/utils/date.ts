export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDayOfWeek(dateStr: string): number {
  return parseDate(dateStr).getDay();
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function getStartOfWeek(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return formatDate(date);
}

export function getEndOfWeek(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = date.getDay();
  date.setDate(date.getDate() + (6 - day));
  return formatDate(date);
}

export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

export function formatDateDisplay(dateStr: string): string {
  const date = parseDate(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function getWeekdayName(dateStr: string): string {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[getDayOfWeek(dateStr)];
}

export function isToday(dateStr: string): boolean {
  return isSameDay(dateStr, getToday());
}
