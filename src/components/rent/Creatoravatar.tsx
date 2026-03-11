"use client";
import { useState, useEffect } from "react";

type CreatorAvatarProps = {
  profileImage?: string;
  username?: string;
  initial: string;
};

export function CreatorAvatar({ profileImage, username, initial }: CreatorAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profileImage]);

  if (profileImage && !imageFailed) {
    return (
      <img
        src={profileImage}
        alt=""
        aria-label={username || "Creator"}
        className="w-6 h-6 rounded-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
      {initial}
    </div>
  );
}