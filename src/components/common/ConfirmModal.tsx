import React, { FC, useEffect, useRef } from "react";
import { MdClose, MdWarning } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (inputValue?: string) => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    confirmButtonColor?: string;
    showTextarea?: boolean;
    textareaLabel?: string;
    textareaPlaceholder?: string;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isLoading = false,
    confirmButtonColor = "#ef4444",
    showTextarea = false,
    textareaLabel = "Reason",
    textareaPlaceholder = "Enter your reason here...",
}) => {
    const { currentTheme } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = React.useState("");

    useEffect(() => {
        if (isOpen) {
            setInputValue("");
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => !isLoading && onClose()}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all scale-100 opacity-100 border overflow-hidden"
                style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.borderColor
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: currentTheme.borderColor }}>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                        <MdWarning className="text-orange-500" size={22} />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 rounded-full hover:bg-black/5 transition-colors disabled:opacity-50"
                        style={{ color: currentTheme.textColor }}
                    >
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm font-medium leading-relaxed" style={{ color: currentTheme.textColor }}>
                        {message}
                    </p>

                    {showTextarea && (
                        <div className="mt-4">
                            <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.headingColor }}>
                                {textareaLabel}
                            </label>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={textareaPlaceholder}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 transition-all font-medium text-sm"
                                style={{
                                    backgroundColor: currentTheme.cardBg,
                                    borderColor: currentTheme.borderColor,
                                    color: currentTheme.textColor,
                                }}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 bg-black/5">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-bold rounded-lg border hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                        style={{
                            color: currentTheme.textColor,
                            borderColor: currentTheme.borderColor
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => onConfirm(inputValue)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md hover:brightness-110 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ backgroundColor: confirmButtonColor }} // Use prop color
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};