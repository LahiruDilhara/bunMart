"use client";

/**
 * Auth hook – provides the current authenticated user's ID.
 *
 * TODO: Replace with your real auth implementation when ready:
 *   - NextAuth:  useSession().data?.user?.id
 *   - Clerk:     useAuth().userId
 *   - Custom JWT: decode from cookie / context
 *
 * For now, manually set the userId below.
 */

// ✏️ Change this to test with different users
const CURRENT_USER_ID = "3";

export function useAuth() {
  return {
    userId: CURRENT_USER_ID,
    loading: false,
  };
}