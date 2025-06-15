export function getColumnAndRowIndexFromGameDataArrayIndex(index) {
  return [index % 4, Math.floor(index / 4)];
}
