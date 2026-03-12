import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type ParamValue = string | number | boolean | null | undefined;

/**
 * Syncs a flat key-value map to the URL query string.
 *
 * Extracted from useProperties and useRentProperties which duplicated
 * almost identical syncToUrl logic.
 *
 * Rules:
 * - Null, undefined, empty string, or "All" values are omitted (clean URLs).
 * - `page` and `limit` are always written.
 * - Custom `omitDefaults` lets you skip additional known-default values.
 *
 * Usage:
 * ```ts
 * const { syncToUrl } = useUrlSync();
 *
 * syncToUrl({
 *   tab: activeTab,
 *   page: pagination.page,
 *   limit: pagination.limit,
 *   search: filters.searchQuery,
 *   status: filters.filterStatus,
 * }, {
 *   omitDefaults: { tab: "all", status: "All" },
 *   always: ["page", "limit"],
 * });
 * ```
 */
export function useUrlSync() {
  const router = useRouter();
  const pathname = usePathname();

  const syncToUrl = useCallback(
    (
      params: Record<string, ParamValue>,
      options: {
        /** Keys whose default values should be omitted from the URL */
        omitDefaults?: Record<string, ParamValue>;
        /** Keys that are always written to the URL regardless of value */
        always?: string[];
      } = {}
    ) => {
      const { omitDefaults = {}, always = ["page", "limit"] } = options;
      const urlParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        const isAlways = always.includes(key);
        const stringValue = value == null ? "" : String(value);
        const defaultValue =
          omitDefaults[key] != null ? String(omitDefaults[key]) : null;

        // Skip empty / "All" unless forced
        if (!isAlways) {
          if (!stringValue || stringValue === "All") continue;
          if (defaultValue !== null && stringValue === defaultValue) continue;
        }

        if (stringValue) urlParams.set(key, stringValue);
      }

      router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  return { syncToUrl };
}