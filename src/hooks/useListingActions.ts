import { useState, useCallback } from "react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

type ActionType = "approve" | "reject" | "activate" | "deactivate";

interface ListingAction {
  id: string | number;
  type: ActionType;
}

interface UseListingActionsOptions {
  onAction: (action: ActionType, id: string | number, reason?: string) => Promise<void>;
  onSuccess?: () => void;
}

/**
 * Manages the shared approve / reject / activate / deactivate modal state
 * that was duplicated in both useProperties and useRentProperties.
 *
 * Handles:
 *  - Pending action & ID state
 *  - Modal open/close
 *  - Loading state
 *  - Toast on success / error
 *
 * Usage:
 * ```ts
 * const { isActionModalOpen, ... } = useListingActions({
 *   onAction: async (type, id, reason) => {
 *     if (type === "approve") await approveProperty(id);
 *     else if (type === "reject") await rejectProperty(id, reason);
 *   },
 *   onSuccess: () => setRefreshKey((k) => k + 1),
 * });
 * ```
 */
export function useListingActions({ onAction, onSuccess }: UseListingActionsOptions) {
  const [pendingAction, setPendingAction] = useState<ListingAction | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const openAction = useCallback((id: string | number, type: ActionType) => {
    setPendingAction({ id, type });
    setIsActionModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsActionModalOpen(false);
    setPendingAction(null);
  }, []);

  const onApproveClick = useCallback((id: string | number) => openAction(id, "approve"), [openAction]);
  const onRejectClick = useCallback((id: string | number) => openAction(id, "reject"), [openAction]);
  const onActivateClick = useCallback((id: string | number) => openAction(id, "activate"), [openAction]);
  const onDeactivateClick = useCallback((id: string | number) => openAction(id, "deactivate"), [openAction]);

  const handleConfirmAction = useCallback(
    async (reason?: string) => {
      if (!pendingAction) return;
      setActionLoading(true);
      try {
        await onAction(pendingAction.type, pendingAction.id, reason);
        const labels: Record<ActionType, string> = {
          approve: "approved",
          reject: "rejected",
          activate: "activated",
          deactivate: "deactivated",
        };
        showSuccessToast(`Item ${labels[pendingAction.type]} successfully!`);
        onSuccess?.();
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : `Failed to ${pendingAction.type} item.`;
        showErrorToast(msg);
      } finally {
        setActionLoading(false);
        closeModal();
      }
    },
    [pendingAction, onAction, onSuccess, closeModal]
  );

  return {
    isActionModalOpen,
    pendingAction: pendingAction?.type ?? null,
    pendingItemId: pendingAction?.id ?? null,
    actionLoading,
    onApproveClick,
    onRejectClick,
    onActivateClick,
    onDeactivateClick,
    handleConfirmAction,
    closeModal,
  };
}