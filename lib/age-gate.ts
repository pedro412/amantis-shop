/**
 * Age verification persistence. Cookie is the source of truth for SSR; the
 * localStorage mirror is a redundancy in case the user blocks third-party
 * cookies but allows site-local storage. Both expire together at one year.
 */

export const AGE_COOKIE = 'amantis.age';
export const AGE_STORAGE_KEY = 'amantis.age';
export const AGE_VALUE = '1';
export const AGE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
