/**
 * Shared helper functions used across useProperties, useRentProperties, and other hooks.
 *
 * Previously copy-pasted or partially duplicated in multiple files.
 */

// ─── Error handling ───────────────────────────────────────────────────────────

/**
 * Safely extract a string error message from any thrown value.
 *
 * Was duplicated in useRentProperties as a local `getErrorMessage` helper.
 */
export function getErrorMessage(error: unknown, fallback = "An error occurred"): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    // Axios response errors
    if (e.response && typeof e.response === "object") {
      const res = e.response as Record<string, unknown>;
      if (res.data && typeof res.data === "object") {
        const data = res.data as Record<string, unknown>;
        if (typeof data.message === "string") return data.message;
      }
    }
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
  }
  return fallback;
}

// ─── Object helpers ───────────────────────────────────────────────────────────

/**
 * Safely cast any value to a plain Record. Returns {} for non-objects.
 *
 * Was duplicated as `toRecord` in useRentProperties.
 */
export function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Pick the first non-empty string value from an object by trying several keys in order.
 *
 * Was duplicated as `pickString` in useRentProperties.
 */
export function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

// ─── Number utilities ─────────────────────────────────────────────────────────

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── String utilities ─────────────────────────────────────────────────────────

/**
 * Convert snake_case / kebab-case / camelCase to Title Case.
 *
 * Was in Rolehelpers.ts as `toTitleCase`.
 * Re-exported here so non-role code doesn't need to import from Rolehelpers.
 */
export function toTitleCase(value?: string | null): string {
  return String(value ?? "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Normalize a string by lowercasing and removing all separators.
 * Used for role-name comparison.
 *
 * Was duplicated in both authUtils.ts (as `normalizeRoleValue`) and
 * Rolehelpers.ts (same name, same logic).
 */
export function normalizeValue(value?: string | null): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

/**
 * Returns a debounced version of `fn` that delays invocation by `delay` ms.
 * Useful for search inputs to avoid firing on every keystroke.
 *
 * Both useProperties and useRentProperties used setTimeout + clearTimeout
 * directly inside useEffect — this encapsulates that pattern.
 *
 * Usage (inside a React component / hook):
 * ```ts
 * const debouncedFetch = useMemo(() => debounce(fetchData, 500), [fetchData]);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}