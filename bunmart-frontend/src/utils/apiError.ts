import axios from "axios";

/**
 * Extract a user-friendly error message from an API error.
 * Backend may return { error: "..." }, { message: "..." }, or { errorMessage: "..." }.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const d = data as { error?: string; message?: string; errorMessage?: string };
      const msg = d.error ?? d.message ?? d.errorMessage;
      if (typeof msg === "string" && msg) return msg;
    }
    if (error.response?.status === 404) return "Not found.";
    if (error.response?.status === 401) return "Please sign in again.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
