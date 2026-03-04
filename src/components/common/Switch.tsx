import React, { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    label,
    checked,
    onChange,
    className = "",
}) => {
    const { currentTheme } = useTheme();

    return (
        <div
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none gap-4 group hover:bg-gray-50/50 ${className}`}
            style={{
                borderColor: checked ? currentTheme.primary : currentTheme.borderColor,
                backgroundColor: checked ? `${currentTheme.primary}10` : "transparent", // 10% opacity
            }}
            onClick={() => onChange(!checked)}
        >
            <span
                className="font-medium text-sm flex-1"
                style={{
                    color: checked ? currentTheme.primary : currentTheme.textColor,
                }}
            >
                {label}
            </span>

            <div className="relative inline-flex items-center cursor-pointer pointer-events-none">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    readOnly
                />
                <div
                    className={`
                w-11 h-6 rounded-full peer peer-focus:outline-none 
                peer-checked:after:translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:border-gray-300 after:border after:rounded-full 
                after:h-5 after:w-5 after:transition-all 
                dark:border-gray-600 dark:bg-gray-700
                ${checked ? "bg-blue-600" : "bg-gray-200"}
            `}
                    style={{ backgroundColor: checked ? currentTheme.primary : undefined }}
                ></div>
            </div>
        </div>
    );
};
