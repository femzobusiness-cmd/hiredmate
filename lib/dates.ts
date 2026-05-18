export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function differenceInDays(later: Date, earlier: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((later.getTime() - earlier.getTime()) / msPerDay);
}
