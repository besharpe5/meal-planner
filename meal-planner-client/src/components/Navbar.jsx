// src/components/NavBar.jsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function navLinkClass({ isActive }) {
  return `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`;
}

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Hide nav on auth pages
  const hideOnRoutes = ["/login", "/register"];
  const shouldHide = hideOnRoutes.includes(location.pathname);

  if (shouldHide) return null;

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-lg text-gray-900">
          Meal Planner
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/plan" className={navLinkClass}>
            Plan
          </NavLink>

          <NavLink to="/profile" className={navLinkClass}>
            Profile
          </NavLink>

          <button
            type="button"
            onClick={onLogout}
            className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
