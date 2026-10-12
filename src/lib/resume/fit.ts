export const MAX_FIT_PASSES = 24;

/** Shrink only during a measurement pass: growing again can oscillate at wraps. */
export function nextFitScale(
  current: number,
  height: number,
  available: number,
  fontSize: number,
  pass: number,
): number {
  if (
    pass >= MAX_FIT_PASSES ||
    ![current, height, available, fontSize].every(Number.isFinite) ||
    height <= 0 ||
    available <= 0 ||
    fontSize <= 0 ||
    height <= available + 0.5
  )
    return current;

  // Preserve deliberately selected smaller sizes; auto-fit never goes below 9pt.
  const minimum = Math.min(1, 9 / fontSize);
  const next = Math.max(minimum, Math.min(current, ((current * available) / height) * 0.998));
  return current - next > 0.0001 ? next : current;
}
