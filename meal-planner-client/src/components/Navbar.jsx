import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "./Link";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  Plus,
  LogOut,
} from "lucide-react";

const BRAND = {
  green: "rgb(127,155,130)", // #7F9B82
  greenHover: "rgb(112,140,115)",
};

function topLinkClass({ isActive }) {
  return `px-3 py-2 rounded-xl text-sm font-semibold tracking-[-0.01em] transition ${
    isActive
    ? "bg-[rgba(127,155,130,0.18)] text-gray-900"
      : "text-gray-700 hover:bg-gray-50"
  }`;
}

function bottomLinkClass(isActive) {
  return `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition ${
    isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
  }`;
}

// Best-effort haptics (works on many Android devices, not reliably on iOS)
function hapticTap() {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
  } catch {
    // ignore
  }
}

export default function Navbar() {
  const pageContext = usePageContext();
  const { logout, isAuthenticated, loading } = useContext(AuthContext);
  const pathname = pageContext.urlPathname;

  // Hide nav on public pages
  const hideOnRoutes = ["/", "/login", "/register", "/privacy", "/about"];
  const shouldHideForRoute = hideOnRoutes.includes(pathname);

  // Smart mobile bar behavior (scroll)
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  // Hide when keyboard is open (mobile)
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    setShowMobileNav(true);
    lastYRef.current = window.scrollY || 0;
  }, [pathname]);

  // Detect keyboard open using VisualViewport (best) + focus fallback
  useEffect(() => {
    const vv = window.visualViewport;

    const updateKeyboardState = () => {
      const base = window.innerHeight || 0;
      const current = vv?.height || base;
      const diff = base - current;
      setKeyboardOpen(diff > 140);
    };

    const onFocusIn = (e) => {
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        setKeyboardOpen(true);
      }
    };

    const onFocusOut = () => {
      setTimeout(() => {
        if (vv) updateKeyboardState();
        else setKeyboardOpen(false);
      }, 80);
    };

    if (vv) {
      vv.addEventListener("resize", updateKeyboardState);
      vv.addEventListener("scroll", updateKeyboardState);
      updateKeyboardState();
    }

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateKeyboardState);
        vv.removeEventListener("scroll", updateKeyboardState);
      }
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Scroll hide/show (but don't fight the keyboard rule)
  useEffect(() => {
    const onScroll = () => {
      if (keyboardOpen) return;
      const currentY = window.scrollY || 0;
      if (tickingRef.current) return;

      tickingRef.current = true;
      requestAnimationFrame(() => {
        const delta = currentY - lastYRef.current;

        if (currentY < 12) setShowMobileNav(true);
        else if (delta > 8) setShowMobileNav(false);
        else if (delta < -8) setShowMobileNav(true);

        lastYRef.current = currentY;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [keyboardOpen]);

  if (loading) return null;
  if (shouldHideForRoute || !isAuthenticated) return null;

  const onLogout = () => {
    hapticTap();
    logout();
    navigate("/login");
  };

  // If keyboard is open, force-hide the mobile bar
  const mobileVisible = showMobileNav && !keyboardOpen;

  return (
    <>
      {/* TOP NAV (desktop) */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/app/dashboard"
            className="font-semibold tracking-[-0.02em] text-lg text-gray-900"
          >
            mealplanned
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/app/dashboard"
              className={topLinkClass({
                isActive: pathname === "/app/dashboard",
              })}
            >
              Dashboard
              </Link>
            <Link
              to="/app/plan"
              className={topLinkClass({
                isActive: pathname === "/app/plan",
              })}
            >
              Plan
              </Link>
            <Link
              to="/app/profile"
              className={topLinkClass({
                isActive: pathname === "/app/profile",
              })}
            >
              Profile
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="ml-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      {/* BOTTOM NAV (mobile) */}
      <nav
        className={[
          "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200",
          "transition-transform duration-200 ease-out",
          mobileVisible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="relative mx-auto max-w-5xl px-2 py-2">
          {/* Floating center action */}
          <Link
            to="/app/meals/new"
            onClick={hapticTap}
            className="absolute left-1/2 -top-6 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition
                       bg-[rgb(127,155,130)] hover:bg-[rgb(112,140,115)]"
            aria-label="Create meal"
          >
            <Plus className="h-6 w-6" />
          </Link>

          <div className="grid grid-cols-5 gap-2 pt-4">
            <Link
              to="/app/dashboard"
              onClick={hapticTap}
              className={bottomLinkClass(pathname === "/app/dashboard")}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[11px] font-medium">Home</span>
            </Link>

            <Link
              to="/app/plan"
              onClick={hapticTap}
              className={bottomLinkClass(pathname === "/app/plan")}
            >
              <CalendarDays className="h-5 w-5" />
              <span className="text-[11px] font-medium">Plan</span>
            </Link>

            {/* spacer for center button */}
            <div />

            <Link
              to="/app/profile"
              onClick={hapticTap}
              className={bottomLinkClass(pathname === "/app/profile")}
            >
              <User className="h-5 w-5" />
              <span className="text-[11px] font-medium">Profile</span>
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 transition"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[11px] font-medium">Log out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
