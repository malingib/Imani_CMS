// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockInvoke = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock("./supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    functions: {
      invoke: mockInvoke,
    },
  },
}));

describe("useAuth", () => {
  let useAuth: typeof import("./supabase-auth").useAuth;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("./supabase-auth");
    useAuth = mod.useAuth;
  });

  it("login calls signInWithPassword", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    const { result } = renderHook(() => useAuth());
    const data = await act(async () => result.current.login("a@b.com", "pass123"));
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: "a@b.com", password: "pass123" });
    expect(data.user.id).toBe("u-1");
  });

  it("login throws on error", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: null, error: { message: "Invalid credentials" } });
    const { result } = renderHook(() => useAuth());
    await expect(act(async () => result.current.login("a@b.com", "wrong"))).rejects.toThrow("Invalid credentials");
  });

  it("signup calls signUp with name in options", async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: "u-2" } }, error: null });
    const { result } = renderHook(() => useAuth());
    const data = await act(async () => result.current.signup("a@b.com", "Pass1234", "Alice"));
    expect(mockSignUp).toHaveBeenCalledWith({ email: "a@b.com", password: "Pass1234", options: { data: { name: "Alice" } } });
    expect(data.user.id).toBe("u-2");
  });

  it("requestPasswordReset invokes edge function", async () => {
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
    const { result } = renderHook(() => useAuth());
    await act(async () => result.current.requestPasswordReset("a@b.com"));
    expect(mockInvoke).toHaveBeenCalledWith("password-reset", { body: { email: "a@b.com" } });
  });

  it("requestPasswordReset throws on failed response", async () => {
    mockInvoke.mockResolvedValue({ data: { success: false, error: "User not found" }, error: null });
    const { result } = renderHook(() => useAuth());
    await expect(act(async () => result.current.requestPasswordReset("a@b.com"))).rejects.toThrow("User not found");
  });

  it("logout calls signOut", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth());
    await act(async () => result.current.logout());
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});

describe("useSession", () => {
  let useSession: typeof import("./supabase-auth").useSession;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } });
    const mod = await import("./supabase-auth");
    useSession = mod.useSession;
  });

  it("starts with loading true and null user", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const { result } = renderHook(() => useSession());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("loads user from session", async () => {
    const fakeUser = { id: "u-1", email: "a@b.com" };
    mockGetSession.mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } });

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("listens for auth state changes", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      setTimeout(() => cb("SIGNED_IN", { user: { id: "u-new" } }), 10);
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.user).toEqual({ id: "u-new" });
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("cleans up subscription on unmount", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } });

    const { unmount } = renderHook(() => useSession());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});
