import { useCallback } from "react";
import { authClient, useSession } from "../lib/auth-client";

export function useAuth() {
  const { data: sessionData, isPending: isLoading } = useSession();
  const user = sessionData?.user ?? null;
  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message ?? "Login failed");
    return result.data;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const result = await authClient.signUp.email({ email, password, name });
    if (result.error) throw new Error(result.error.message ?? "Signup failed");
    return result.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authClient.signOut(); } catch {}
    window.location.href = "/login";
  }, []);

  return { user, isLoading, isAuthenticated, login, signup, logout };
}
