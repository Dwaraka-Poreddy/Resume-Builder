/** Layout heights must be unscaled CSS pixels (offsetHeight), never zoomed rectangles. */
export function paginateColumns(heights: number[][], available: number, headerHeight: number) {
  const pages: number[][][] = [[[], []]];
  let oversized = headerHeight > available;
  heights.forEach((items, column) => {
    let page = 0;
    let used = headerHeight;
    items.forEach((height, index) => {
      if (height > available) oversized = true;
      if (used + height > available && used > 0 && height <= available) {
        page += 1;
        used = 0;
        pages[page] ??= [[], []];
      }
      pages[page]![column]!.push(index);
      used += height;
    });
  });
  return { pages, oversized };
}
