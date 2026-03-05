"use client";

import type { UserProfile } from "@/models/profile";

interface ProfileHeaderCardProps {
  user: UserProfile;
  onEditProfile: () => void;
}

export function ProfileHeaderCard({ user, onEditProfile }: ProfileHeaderCardProps) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-6 items-center">
          {user.avatarUrl ? (
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-4 border-stone-100 dark:border-stone-800 flex-shrink-0" role="img" aria-label="Profile avatar" style={{ backgroundImage: `url("${user.avatarUrl}")` }} />
          ) : (
            <div className="flex items-center justify-center rounded-full h-24 w-24 border-4 border-stone-100 dark:border-stone-800 bg-primary text-white font-bold text-2xl flex-shrink-0">{initials}</div>
          )}
          <div className="flex flex-col">
            <p className="text-[#181511] dark:text-white text-xl font-bold leading-tight">{user.name}</p>
            <p className="text-[#8a7960] dark:text-stone-400 text-sm">{user.email}</p>
            {user.phone && <p className="text-[#8a7960] dark:text-stone-400 text-sm">{user.phone}</p>}
            <p className="text-primary text-sm font-medium mt-1">Joined {user.joinedDate}</p>
          </div>
        </div>
        <button onClick={onEditProfile} className="flex items-center justify-center rounded-lg h-10 px-5 bg-stone-100 dark:bg-stone-800 text-[#181511] dark:text-white text-sm font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer">
          Edit Profile
        </button>
      </div>
    </div>
  );
}