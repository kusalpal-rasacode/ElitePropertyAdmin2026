"use client";
import React from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useTheme } from "@/providers/ThemeProvider";
import type { PendingAction } from "@/types/properties.types";

interface PropertiesActionModalProps {
    isOpen: boolean;
    pendingAction: PendingAction | null;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
}

const ACTION_CONFIG: Record<
    PendingAction,
    { title: string; message: string; confirmLabel: string; color: string }
> = {
    approve: {
        title: "Approve Property",
        message: "Are you sure you want to approve this property? It will become active immediately.",
        confirmLabel: "Approve",
        color: "", // filled by theme primary in parent
    },
    reject: {
        title: "Reject Property",
        message: "Are you sure you want to reject this property? This action cannot be undone.",
        confirmLabel: "Reject",
        color: "#ef4444",
    },
    activate: {
        title: "Activate Property",
        message: "Are you sure you want to activate this property? It will be visible to users.",
        confirmLabel: "Activate",
        color: "", // filled by theme primary in parent
    },
    deactivate: {
        title: "Deactivate Property",
        message: "Are you sure you want to deactivate this property? It will be hidden from users.",
        confirmLabel: "Deactivate",
        color: "#f59e0b",
    },
};

export function PropertiesActionModal({
    isOpen,
    pendingAction,
    isLoading,
    onClose,
    onConfirm,
}: PropertiesActionModalProps) {
    const { currentTheme } = useTheme();
    if (!pendingAction) return null;

    const config = ACTION_CONFIG[pendingAction];
    const confirmButtonColor =
        pendingAction === "approve" || pendingAction === "activate"
            ? currentTheme.primary
            : config.color;

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={config.title}
            message={config.message}
            confirmLabel={config.confirmLabel}
            isLoading={isLoading}
            confirmButtonColor={confirmButtonColor}
            showTextarea={pendingAction === "reject"}
            textareaLabel="Rejection Reason (Optional)"
            textareaPlaceholder="Please provide a reason for rejecting this property..."
        />
    );
}