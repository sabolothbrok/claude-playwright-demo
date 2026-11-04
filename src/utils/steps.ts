import { test } from '@playwright/test';

/** Methods whose arguments must never appear in a report (credentials). */
const SENSITIVE = /login|password|credential|secret|token/i;

const humanize = (name: string): string => {
  const words = name
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const describeArgs = (method: string, args: unknown[]): string => {
  if (SENSITIVE.test(method)) return '';
  const shown = args.filter((a) => typeof a === 'string' || typeof a === 'number');
  return shown.length ? `: ${shown.join(', ')}` : '';
};

/**
 * Wraps a Page Object so each public action shows up as one readable step in the
 * HTML and Allure reports ("Add to cart by name: Sauce Labs Backpack") instead of
 * a list of raw locator calls. Only calls made from a spec become steps; calls a
 * Page Object makes on itself stay inside the parent step.
 */
export function withSteps<T extends object>(pageObject: T): T {
  return new Proxy(pageObject, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function' || typeof prop !== 'string' || prop === 'constructor') {
        return value;
      }
      return (...args: unknown[]) =>
        test.step(`${humanize(prop)}${describeArgs(prop, args)}`, () => value.apply(target, args));
    },
  });
}
