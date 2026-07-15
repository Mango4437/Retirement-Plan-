const monthYearFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}

export function formatHours(hours: number): string {
  return `${Math.round(hours).toLocaleString()} hrs`;
}

/** e.g. 18 -> "1 year 6 months", 6 -> "6 months" */
export function formatDuration(totalMonths: number): string {
  const rounded = Math.round(totalMonths);
  const years = Math.floor(rounded / 12);
  const months = rounded % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0 || parts.length === 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  return parts.join(" ");
}
