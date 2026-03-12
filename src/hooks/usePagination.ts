import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  /** If true, syncs page to URL query params automatically */
  syncUrl?: boolean;
}

/**
 *
 * Usage:
 * ```ts
 * const { pagination, setPaginationMeta, handleSetPage } = usePagination({ syncUrl: true });
 * ```
 */
export function usePagination({
  defaultPage,
  defaultLimit = 9,
  syncUrl = false,
}: UsePaginationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page"));
const initialPage =
  defaultPage ?? (Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
  const initialLimit = Number(searchParams.get("limit")) || defaultLimit;

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
  });

  /** Update total / totalPages coming back from the API */
  const setPaginationMeta = useCallback(
    (meta: { total: number; totalPages: number }) => {
      setPagination((prev) => ({
        ...prev,
        total: meta.total,
        totalPages: meta.totalPages,
      }));
    },
    []
  );

  /** Navigate to a specific page, optionally pushing to URL */
  const handleSetPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));

      if (syncUrl) {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router, syncUrl]
  );

  /** Reset page to 1 (e.g. when filters change) */
  const resetPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return { pagination, setPagination, setPaginationMeta, handleSetPage, resetPage };
}