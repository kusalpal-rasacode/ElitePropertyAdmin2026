// utils/toast.tsx
import toast from "react-hot-toast";
import {
    RiCheckLine,
    RiCloseLine,
    RiErrorWarningLine,
    RiInformationLine,
} from "react-icons/ri";

// Success Toast (Green)
export const showSuccessToast = (message: string) => {
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? "animate-toast-in" : "animate-toast-out"
                    } bg-white/95 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 min-w-[320px]`}
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <RiCheckLine className="w-5 h-5 text-white" />
                </div>
                <p className="text-[15px] text-gray-900 font-medium flex-1">
                    {message}
                </p>
            </div>
        ),
        { duration: 1000 },
    );
};

// Error Toast (Red)
export const showErrorToast = (message: string) => {
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? "animate-toast-in" : "animate-toast-out"
                    } bg-white/95 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 min-w-[320px]`}
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <RiCloseLine className="w-5 h-5 text-white" />
                </div>
                <p className="text-[15px] text-gray-900 font-medium flex-1">
                    {message}
                </p>
            </div>
        ),
        { duration: 1000 },
    );
};

// Warning Toast (Yellow/Orange)
export const showWarningToast = (message: string) => {
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? "animate-toast-in" : "animate-toast-out"
                    } bg-white/95 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 min-w-[320px]`}
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <RiErrorWarningLine className="w-5 h-5 text-white" />
                </div>
                <p className="text-[15px] text-gray-900 font-medium flex-1">
                    {message}
                </p>
            </div>
        ),
        { duration: 1000 },
    );
};

// Info Toast (Blue)
export const showInfoToast = (message: string) => {
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? "animate-toast-in" : "animate-toast-out"
                    } bg-white/95 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 min-w-[320px]`}
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <RiInformationLine className="w-5 h-5 text-white" />
                </div>
                <p className="text-[15px] text-gray-900 font-medium flex-1">
                    {message}
                </p>
            </div>
        ),
        { duration: 1000 },
    );
};
