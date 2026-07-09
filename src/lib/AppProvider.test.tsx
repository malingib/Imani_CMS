// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const fakeUser: Partial<SupabaseUser> = {
  id: "u-1",
  email: "admin@church.test",
  user_metadata: { name: "Admin", avatar_url: "" },
  app_metadata: { role: "ADMIN", church_id: "c-1" },
};

const fakeSuperAdmin: Partial<SupabaseUser> = {
  id: "super-1",
  email: "owner@imani.test",
  user_metadata: { name: "Owner", avatar_url: "" },
  app_metadata: { role: "SUPER_ADMIN" },
};

const { mockUseSession, mockUseChurch, mockLoadChurchData, mockCreateAuditLog, mockPersistence } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockUseChurch: vi.fn(),
  mockLoadChurchData: vi.fn(),
  mockCreateAuditLog: vi.fn(),
  mockPersistence: {
    createMember: vi.fn(),
    createMembers: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    createEvent: vi.fn(),
    deleteEvent: vi.fn(),
    replaceEventAttendance: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    createRecurringExpense: vi.fn(),
    createCommunication: vi.fn(),
    updateNotificationRead: vi.fn(),
    markAllNotificationsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

vi.mock("./supabase-auth", () => ({
  useSession: () => mockUseSession(),
  supabase: { auth: { signOut: vi.fn() }, from: vi.fn(), rpc: vi.fn() },
}));

vi.mock("./church-context", () => ({
  useChurch: () => mockUseChurch(),
}));

vi.mock("./persistence", () => ({
  createPersistenceService: vi.fn(() => mockPersistence),
}));

vi.mock("./app-data", () => ({
  createChurchAppDataService: vi.fn(() => ({
    loadChurchAppData: (...args: any[]) => mockLoadChurchData(...args),
    createAuditLog: (...args: any[]) => mockCreateAuditLog(...args),
  })),
}));

vi.mock("./notification-service", () => ({
  countUnread: vi.fn(),
}));

vi.mock("./app-user", () => ({
  mapSupabaseUserToAppUser: (u: any) => ({
    id: u.id,
    name: u.user_metadata?.name || "User",
    role: u.app_metadata?.role || "MEMBER",
    churchId: u.app_metadata?.church_id || null,
    avatar: u.user_metadata?.avatar_url || "",
  }),
  getDefaultViewForUserRole: vi.fn(() => "DASHBOARD"),
}));

import { AppProvider, useApp } from "./AppProvider";

function TestConsumer() {
  const ctx = useApp();
  return (
    <div>
      <span data-testid="loading">{ctx.loading}</span>
      <span data-testid="user">{ctx.currentUser?.name || "none"}</span>
      <span data-testid="members">{ctx.members.length}</span>
    </div>
  );
}

describe("AppProvider", () => {
  afterEach(cleanup);
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when ready", async () => {
    mockUseSession.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: null, setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });

    render(
      <AppProvider>
        <div data-testid="child">Hello</div>
      </AppProvider>
    );

    await waitFor(() => expect(screen.getByTestId("child")).toBeTruthy());
  });

  it("masquerades context through useApp", async () => {
    mockUseSession.mockReturnValue({ user: fakeUser, isAuthenticated: true, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: null, setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });
    mockLoadChurchData.mockResolvedValue({
      members: [], transactions: [], events: [], budgets: [],
      recurringExpenses: [], communications: [], notifications: [],
      auditLogs: [], groups: [], sermons: [],
      totalMembers: 0, totalTransactions: 0, totalEvents: 0,
      totalBudgets: 0, totalRecurringExpenses: 0, totalAuditLogs: 0,
    });

    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("Admin");
    });
  });

  it("handleLogin creates audit log and shows toast", async () => {
    mockUseSession.mockReturnValue({ user: fakeUser, isAuthenticated: true, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: "c-1", setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });
    mockLoadChurchData.mockResolvedValue({
      members: [], transactions: [], events: [], budgets: [],
      recurringExpenses: [], communications: [], notifications: [],
      auditLogs: [], groups: [], sermons: [],
      totalMembers: 0, totalTransactions: 0, totalEvents: 0,
      totalBudgets: 0, totalRecurringExpenses: 0, totalAuditLogs: 0,
    });
    mockCreateAuditLog.mockResolvedValue({ id: "a-1", userId: "u-1", userName: "Admin", action: "Login success", module: "DASHBOARD", severity: "INFO", timestamp: new Date().toISOString() });

    function LoginTest() {
      const { handleLogin, toasts, auditLogs, currentUser } = useApp();
      return (
        <div>
          <span data-testid="user">{currentUser?.name || "none"}</span>
          <span data-testid="toasts">{toasts.length}</span>
          <span data-testid="audits">{auditLogs.length}</span>
          <button onClick={() => handleLogin({ id: "u-1", name: "Admin", role: "ADMIN" as any, avatar: "" })}>
            Login
          </button>
        </div>
      );
    }

    render(
      <AppProvider>
        <LoginTest />
      </AppProvider>
    );

    await waitFor(() => expect(screen.getByTestId("toasts").textContent).toBe("0"));
    act(() => screen.getByText("Login").click());

    await waitFor(() => {
      expect(screen.getByTestId("toasts").textContent).toBe("1");
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "Login success" }));
  });

  it("does not require a church audit scope for platform super admins", async () => {
    mockUseSession.mockReturnValue({ user: fakeSuperAdmin, isAuthenticated: true, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: null, setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });
    mockLoadChurchData.mockResolvedValue({
      members: [], transactions: [], events: [], budgets: [],
      recurringExpenses: [], communications: [], notifications: [],
      auditLogs: [], groups: [], sermons: [],
      totalMembers: 0, totalTransactions: 0, totalEvents: 0,
      totalBudgets: 0, totalRecurringExpenses: 0, totalAuditLogs: 0,
    });

    function SuperAdminLoginTest() {
      const { handleLogin, loading, viewingPlatform, toasts } = useApp();
      return (
        <div>
          <span data-testid="loading">{loading}</span>
          <span data-testid="platform">{String(viewingPlatform)}</span>
          <span data-testid="toasts">{toasts.length}</span>
          <button onClick={() => handleLogin({ id: "super-1", name: "Owner", role: "SUPER_ADMIN" as any, avatar: "" })}>
            Login
          </button>
        </div>
      );
    }

    render(
      <AppProvider>
        <SuperAdminLoginTest />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
      expect(screen.getByTestId("platform").textContent).toBe("true");
    });

    act(() => screen.getByText("Login").click());

    await waitFor(() => {
      expect(screen.getByTestId("toasts").textContent).toBe("1");
    });
    expect(mockLoadChurchData).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });

  it("handleAddMember calls persistence and updates state", async () => {
    mockUseSession.mockReturnValue({ user: fakeUser, isAuthenticated: true, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: "c-1", setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });
    mockLoadChurchData.mockResolvedValue({
      members: [], transactions: [], events: [], budgets: [],
      recurringExpenses: [], communications: [], notifications: [],
      auditLogs: [], groups: [], sermons: [],
      totalMembers: 0, totalTransactions: 0, totalEvents: 0,
      totalBudgets: 0, totalRecurringExpenses: 0, totalAuditLogs: 0,
    });
    mockCreateAuditLog.mockResolvedValue({});
    mockPersistence.createMember.mockResolvedValue({
      id: "m-new", firstName: "Jane", lastName: "Doe", phone: "+254700000000",
      email: "", location: "Nairobi", groups: [], status: "Active", joinDate: "2026-01-01",
    });

    function AddMemberTest() {
      const { handleAddMember, members, toasts } = useApp();
      return (
        <div>
          <span data-testid="members">{members.length}</span>
          <span data-testid="toasts">{toasts.length}</span>
          <button onClick={() => handleAddMember({
            id: "", firstName: "Jane", lastName: "Doe", phone: "+254700000000",
            email: "", location: "Nairobi", groups: [], status: "Active" as any, joinDate: "2026-01-01",
          })}>
            Add
          </button>
        </div>
      );
    }

    render(
      <AppProvider>
        <AddMemberTest />
      </AppProvider>
    );

    await waitFor(() => expect(screen.getByTestId("members").textContent).toBe("0"));
    await act(async () => screen.getByText("Add").click());

    await waitFor(() => {
      expect(screen.getByTestId("members").textContent).toBe("1");
    });
    expect(mockPersistence.createMember).toHaveBeenCalledOnce();
  });

  it("handleRSVP skips when no currentUser.memberId", async () => {
    mockUseSession.mockReturnValue({ user: fakeUser, isAuthenticated: true, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: "c-1", setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });
    mockLoadChurchData.mockResolvedValue({
      members: [], transactions: [], events: [
        { id: "e-1", title: "Service", description: "", date: "2026-07-05", time: "10:00", location: "Hall", type: "WORSHIP", attendance: [] },
      ], budgets: [],
      recurringExpenses: [], communications: [], notifications: [],
      auditLogs: [], groups: [], sermons: [],
      totalMembers: 0, totalTransactions: 0, totalEvents: 1,
      totalBudgets: 0, totalRecurringExpenses: 0, totalAuditLogs: 0,
    });

    function RsvpTest() {
      const { handleRSVP, toasts } = useApp();
      return (
        <div>
          <span data-testid="toasts">{toasts.length}</span>
          <span data-testid="lastToast">{toasts[toasts.length - 1]?.message || ""}</span>
          <button onClick={() => handleRSVP("e-1", true)}>RSVP</button>
        </div>
      );
    }

    render(
      <AppProvider>
        <RsvpTest />
      </AppProvider>
    );

    await waitFor(() => expect(screen.getByTestId("toasts").textContent).toBe("0"));
    await act(async () => screen.getByText("RSVP").click());

    await waitFor(() => {
      expect(screen.getByTestId("lastToast").textContent).toContain("Only registered members");
    });
  });

  it("reaches ready when auth finishes loading with no user", async () => {
    mockUseSession.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
    mockUseChurch.mockReturnValue({ activeChurchId: null, setActiveChurchId: vi.fn(), churches: [], fetchChurches: vi.fn() });

    function LoadingTest() {
      const { loading } = useApp();
      return <span data-testid="loading">{loading}</span>;
    }

    render(
      <AppProvider>
        <LoadingTest />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
    });
  });
});
