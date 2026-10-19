/*
 * Business pages must never hang or fail because the database is slow or
 * down. Database calls for them go through here, with a short timeout.
 */

export const DB_TIMEOUT_MS = 1500;

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
