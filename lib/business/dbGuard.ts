/*
 * Business pages must never hang or fail because the database is slow or
 * down. Database calls for them go through here: a short timeout, and an
 * explicit switch for development:
 *   BUSINESS_SOURCE=sample   answer from the built-in sample businesses only
 *                            (no database calls at all)
 */

export const DB_TIMEOUT_MS = 1500;

export const sampleOnly = () => process.env.BUSINESS_SOURCE === "sample";

export function withTimeout<T>(
  promise: Promise<T>,
  ms = DB_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("database timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
