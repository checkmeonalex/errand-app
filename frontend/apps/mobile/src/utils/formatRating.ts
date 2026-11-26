// 4.8 → "4.8"; a runner with no reviews yet shows "New" instead of a made-up
// number.
export function formatRating(rating: number | null | undefined): string {
  return typeof rating === 'number' ? rating.toFixed(1) : 'New';
}
