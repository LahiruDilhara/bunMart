import { useState, useEffect } from "react";
import { isLoggedIn, AUTH_CHANGE_EVENT } from "@/service/authCheckService";

export function useIsLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn());

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    const handler = () => setLoggedIn(isLoggedIn());
    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  }, []);

  return loggedIn;
}
