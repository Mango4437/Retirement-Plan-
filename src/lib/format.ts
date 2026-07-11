export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(iso?: string): boolean {
  return !!iso && iso.slice(0, 10) === todayKey();
}

export function kphToMph(kph: number): number {
  return kph * 0.621371;
}
