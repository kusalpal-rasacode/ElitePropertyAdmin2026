import { useState, useCallback } from "react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

interface UseDeleteConfirmOptions {
  onDelete: (id: string | number) => Promise<void>;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Manages delete confirmation state shared across Properties, Rent, Organizations, Roles, Users.
 *
 * Pattern was copy-pasted in every list page:
 *   const [deleteId, setDeleteId] = useState(null);
 *   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
 *   const initiateDelete = (id) => { setDeleteId(id); };
 *   const confirmDelete = async () => { ... };
 *
 * Usage:
 * ```tsx
 * const { deleteId, initiateDelete, confirmDelete, isDeleteLoading, cancelDelete } =
 *   useDeleteConfirm({
 *     onDelete: (id) => deletePropertyByIdService(String(id)),
 *     onSuccess: () => setRefreshKey((k) => k + 1),
 *     successMessage: "Property deleted successfully",
 *   });
 *
 * // Trigger delete
 * <button onClick={() => initiateDelete(property.id)}>Delete</button>
 *
 * // Confirmation modal
 * <ConfirmModal
 *   isOpen={deleteId !== null}
 *   onClose={cancelDelete}
 *   onConfirm={confirmDelete}
 *   isLoading={isDeleteLoading}
 * />
 * ```
 */
export function useDeleteConfirm({
  onDelete,
  onSuccess,
  successMessage = "Deleted successfully",
  errorMessage = "Failed to delete",
}: UseDeleteConfirmOptions) {
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const initiateDelete = useCallback((id: string | number) => {
    setDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId == null) return;
    setIsDeleteLoading(true);
    try {
      await onDelete(deleteId);
      showSuccessToast(successMessage);
      setDeleteId(null);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : errorMessage;
      showErrorToast(msg);
    } finally {
      setIsDeleteLoading(false);
    }
  }, [deleteId, onDelete, onSuccess, successMessage, errorMessage]);

  return {
    deleteId,
    isDeleteLoading,
    initiateDelete,
    cancelDelete,
    confirmDelete,
  };
}