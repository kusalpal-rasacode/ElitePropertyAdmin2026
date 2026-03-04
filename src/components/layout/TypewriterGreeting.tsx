"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { MdCake } from "react-icons/md";

interface TypewriterGreetingProps {
    userName?: string;
}

// Birthday Decorations Component (Balloons + Ribbons)
const BirthdayDecorations = () => {
    const [balloons, setBalloons] = useState<{ id: number; left: number; animationDuration: number; delay: number; color: string }[]>([]);
    const [ribbons, setRibbons] = useState<{ id: number; left: number; animationDuration: number; delay: number; color: string }[]>([]);

    useEffect(() => {
        // Generate Balloons
        setBalloons(Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDuration: 6 + Math.random() * 4, // Slower for background
            delay: Math.random() * 5,
            color: ['#FF69B4', '#FF1493', '#FF4500', '#FFD700', '#ADFF2F', '#00BFFF', '#9370DB'][Math.floor(Math.random() * 7)]
        })));

        // Generate Ribbons
        setRibbons(Array.from({ length: 15 }).map((_, i) => ({
            id: i + 100,
            left: Math.random() * 100,
            animationDuration: 5 + Math.random() * 4,
            delay: Math.random() * 5,
            color: ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 6)]
        })));
    }, []);

    if (balloons.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Render Balloons */}
            {balloons.map((b) => (
                <div
                    key={b.id}
                    className="absolute -bottom-16 w-5 h-6 rounded-full opacity-60"
                    style={{
                        left: `${b.left}%`,
                        backgroundColor: b.color,
                        boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.1)',
                        animation: `floatUp ${b.animationDuration}s linear infinite`,
                        animationDelay: `${b.delay}s`,
                    }}
                >
                    <div className="absolute top-full left-1/2 w-[1px] h-8 bg-gray-400/30 -translate-x-1/2"></div>
                </div>
            ))}

            {/* Render Ribbons */}
            {ribbons.map((r) => (
                <div
                    key={r.id}
                    className="absolute -top-10 w-2 h-4 opacity-70"
                    style={{
                        left: `${r.left}%`,
                        backgroundColor: r.color,
                        animation: `fall ${r.animationDuration}s linear infinite`,
                        animationDelay: `${r.delay}s`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                />
            ))}

            <style jsx>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(-110vh) rotate(10deg); opacity: 0; }
                }
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default function TypewriterGreeting({ userName = "Rajib" }: TypewriterGreetingProps) {
    const { currentTheme } = useTheme();
    const [text, setText] = useState("");
    const [messageIndex, setMessageIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [timeOfDay, setTimeOfDay] = useState("Day");
    const [hasShownSpecial, setHasShownSpecial] = useState(false);

    // Special Event State
    const [specialEvent, setSpecialEvent] = useState<{
        message: string;
        type: 'birthday' | 'holiday' | 'festival';
        icon: React.ReactNode;
        color: string;
    } | null>(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setTimeOfDay("Morning");
        else if (hour < 18) setTimeOfDay("Afternoon");
        else setTimeOfDay("Evening");
    }, []);

    useEffect(() => {
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const monthDay = `${month}-${day}`;

        // Birthday Logic
        const myBirthday = "02-13";

        if (monthDay === myBirthday) {
            // Extract name logic:
            // 1. Split by '@' to handle emails (take first part)
            // 2. Split by ' ' to handle full names (take first name)
            let firstName = userName || "User";
            if (firstName.includes('@')) {
                firstName = firstName.split('@')[0];
            }
            firstName = firstName.split(' ')[0];

            // Capitalize first letter
            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

            setSpecialEvent({
                message: `Happy Birthday, ${firstName}!`,
                type: 'birthday',
                icon: <MdCake />,
                color: "#D946EF"
            });
        } else {
            setSpecialEvent(null);
        }
    }, [userName]);

    const messages = useMemo(() => {
        // Same extraction logic for consistency
        let firstName = userName || "User";
        if (firstName.includes('@')) {
            firstName = firstName.split('@')[0];
        }
        firstName = firstName.split(' ')[0];
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

        const baseMessages = [
            `Good ${timeOfDay}, ${firstName}!`,
            "Welcome to Elite Property Admin.",
            "Let's manage your portfolio.",
            "Check out new property listings.",
            "Have a great productive day!"
        ];

        if (specialEvent && !hasShownSpecial) {
            return [specialEvent.message, ...baseMessages];
        }

        return baseMessages;
    }, [timeOfDay, userName, specialEvent, hasShownSpecial]);

    useEffect(() => {
        // Adjust index to current array length
        const safeIndex = messageIndex % messages.length;
        const currentMessage = messages[safeIndex];

        if (!isDeleting && text === currentMessage) {
            // Finished typing, wait then delete
            // Wait longer for special message (first message if specialEvent exists)
            const waitTime = (specialEvent && !hasShownSpecial && safeIndex === 0) ? 5000 : 2000;
            const timeout = setTimeout(() => setIsDeleting(true), waitTime);
            return () => clearTimeout(timeout);
        }

        if (isDeleting && text === "") {
            // Finished deleting
            setIsDeleting(false);

            // If we just finished checking the special message (index 0), mark it as shown
            if (specialEvent && !hasShownSpecial && safeIndex === 0) {
                setHasShownSpecial(true);
                // Reset index to 0 for the *new* array (which won't have the birthday message)
                setMessageIndex(0);
            } else {
                setMessageIndex((prev) => prev + 1);
            }
            return;
        }

        const timeout = setTimeout(() => {
            if (isDeleting) {
                setText((prev) => prev.slice(0, -1));
            } else {
                setText(currentMessage.slice(0, text.length + 1));
            }
        }, isDeleting ? 30 : 80);

        return () => clearTimeout(timeout);
    }, [text, isDeleting, messageIndex, messages, specialEvent, hasShownSpecial]);

    // Determine if currently showing the special message
    const safeIndex = messageIndex % messages.length;
    const isShowingSpecial = specialEvent && !hasShownSpecial && safeIndex === 0;

    return (
        <>
            {/* Show Birthday Decorations ALL DAY on Birthday */}
            {specialEvent?.type === 'birthday' && <BirthdayDecorations />}

            <div className="w-[400px] h-7 flex items-center gap-2">
                {/* Animated Icon Logic */}
                {isShowingSpecial && (
                    <div className="animate-bounce" style={{ color: specialEvent.color }}>
                        {React.isValidElement(specialEvent.icon)
                            ? React.cloneElement(specialEvent.icon as React.ReactElement<any>, { size: 24 })
                            : null
                        }
                    </div>
                )}

                <h2
                    className={`text-lg transition-all duration-300 inline-block whitespace-nowrap overflow-hidden ${isShowingSpecial ? 'font-extrabold tracking-wide drop-shadow-sm' : 'font-bold tracking-tight'}`}
                    style={{
                        color: isShowingSpecial ? specialEvent.color : currentTheme.headingColor,
                        WebkitBackgroundClip: isShowingSpecial ? 'text' : 'initial',
                        WebkitTextFillColor: isShowingSpecial ? 'transparent' : 'initial',
                        backgroundImage: isShowingSpecial ? `linear-gradient(to right, ${specialEvent.color}, ${currentTheme.headingColor})` : 'none',
                        backgroundClip: isShowingSpecial ? 'text' : 'initial',
                    }}
                >
                    {text}
                    <span className="animate-pulse ml-0.5 text-blue-500">|</span>
                </h2>
            </div>
        </>
    );
}
