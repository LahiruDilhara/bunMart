import { useState, useEffect } from "react";
import { getProfile } from "@/service/profileService";
import type { UserProfile } from "@/model/profile";

export function ProfileAccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProfile()
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-muted">Loading account…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-6">Account</h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {profile && (
        <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-6 max-w-xl">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Name</dt>
              <dd className="mt-1 font-medium text-foreground dark:text-white">
                {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Email</dt>
              <dd className="mt-1 text-foreground dark:text-white">{profile.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Phone</dt>
              <dd className="mt-1 text-foreground dark:text-white">{profile.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Role</dt>
              <dd className="mt-1 text-foreground dark:text-white capitalize">{profile.role ?? "—"}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
