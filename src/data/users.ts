/**
 * SauceDemo's fixed set of test accounts.
 * All accounts share the same password: "secret_sauce".
 * See https://www.saucedemo.com/ for the canonical list.
 */
export const PASSWORD = process.env.PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: process.env.STANDARD_USER ?? 'standard_user', password: PASSWORD },
  lockedOut: { username: process.env.LOCKED_OUT_USER ?? 'locked_out_user', password: PASSWORD },
  problem: { username: process.env.PROBLEM_USER ?? 'problem_user', password: PASSWORD },
  performanceGlitch: {
    username: process.env.PERFORMANCE_GLITCH_USER ?? 'performance_glitch_user',
    password: PASSWORD,
  },
  error: { username: process.env.ERROR_USER ?? 'error_user', password: PASSWORD },
  visual: { username: process.env.VISUAL_USER ?? 'visual_user', password: PASSWORD },
} as const;

export type UserKey = keyof typeof users;

export const checkoutInfo = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '10101',
};
