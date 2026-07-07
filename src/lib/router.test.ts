import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  pathToView,
  viewToPath,
  getCurrentViewFromHash,
  navigateToView,
  onHashChange,
  getAllRoutes,
  getRoute,
  ROUTES,
} from "./router";

describe("ROUTES", () => {
  it("contains all expected views", () => {
    const views = Object.keys(ROUTES);
    expect(views).toContain("DASHBOARD");
    expect(views).toContain("MEMBERS");
    expect(views).toContain("FINANCE");
    expect(views).toContain("PLATFORM_DASHBOARD");
  });

  it("has unique paths", () => {
    const paths = Object.values(ROUTES).map(r => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("pathToView", () => {
  it("returns view for known path", () => {
    expect(pathToView("/dashboard")).toBe("DASHBOARD");
    expect(pathToView("/members")).toBe("MEMBERS");
    expect(pathToView("/platform")).toBe("PLATFORM_DASHBOARD");
  });

  it("returns null for unknown path", () => {
    expect(pathToView("/unknown")).toBeNull();
  });
});

describe("viewToPath", () => {
  it("returns path for known view", () => {
    expect(viewToPath("DASHBOARD")).toBe("/dashboard");
    expect(viewToPath("MEMBERS")).toBe("/members");
  });

  it("uses fallback for unknown view", () => {
    expect(viewToPath("UNKNOWN" as any)).toBe("/dashboard");
  });
});

describe("getAllRoutes", () => {
  it("returns all routes", () => {
    const routes = getAllRoutes();
    expect(routes.length).toBe(Object.keys(ROUTES).length);
    expect(routes[0]).toHaveProperty("view");
    expect(routes[0]).toHaveProperty("path");
    expect(routes[0]).toHaveProperty("label");
  });
});

describe("getRoute", () => {
  it("returns route for known view", () => {
    const route = getRoute("DASHBOARD");
    expect(route.path).toBe("/dashboard");
    expect(route.label).toBe("Dashboard");
  });
});

describe("hash-based navigation", () => {
  beforeEach(() => {
     const mockLocation = {
      _hash: "",
      get hash() { return this._hash; },
      set hash(v: string) { this._hash = v.startsWith("#") ? v : `#${v}`; },
    } as unknown;
    if (typeof globalThis.window === "undefined") {
      globalThis.window = {
        location: mockLocation,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as any;
    } else {
      Object.defineProperty(globalThis.window, "location", { value: mockLocation, configurable: true });
    }
    globalThis.window.location.hash = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCurrentViewFromHash", () => {
    it("returns DASHBOARD for empty hash", () => {
      globalThis.window.location.hash = "";
      expect(getCurrentViewFromHash()).toBe("DASHBOARD");
    });

    it("returns view for matching hash", () => {
      globalThis.window.location.hash = "#/members";
      expect(getCurrentViewFromHash()).toBe("MEMBERS");
    });

    it("falls back to DASHBOARD for unknown hash", () => {
      globalThis.window.location.hash = "#/unknown";
      expect(getCurrentViewFromHash()).toBe("DASHBOARD");
    });
  });

  describe("navigateToView", () => {
    it("sets hash to the view path", () => {
      navigateToView("FINANCE");
      expect(globalThis.window.location.hash).toBe("#/finance");
    });
  });

  describe("onHashChange", () => {
    it("registers hashchange listener", () => {
      const spy = vi.spyOn(globalThis.window, "addEventListener");
      const cleanup = onHashChange(() => {});
      expect(spy).toHaveBeenCalledWith("hashchange", expect.any(Function));
      cleanup();
    });

    it("returned cleanup removes the listener", () => {
      const spy = vi.spyOn(globalThis.window, "removeEventListener");
      const cleanup = onHashChange(() => {});
      cleanup();
      expect(spy).toHaveBeenCalledWith("hashchange", expect.any(Function));
    });
  });
});
