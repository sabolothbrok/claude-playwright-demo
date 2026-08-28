/** Rounds to 2 decimal places to avoid floating point comparison flakiness. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Sums an array of prices, rounded to 2 decimal places. */
export function sum(prices: number[]): number {
  return round2(prices.reduce((total, price) => total + price, 0));
}
