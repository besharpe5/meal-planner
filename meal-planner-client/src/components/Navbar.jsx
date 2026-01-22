import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Tab({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg ${
          isActive ? "text-blue-700" : "text-gray-600"
        }`
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  );
}

export default function NavBar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { addToast } = useToast();

  const doLogout = () => {
    logout();
    addToast({ type: "success", title: "Logged out" });
    navigate("/login");
  };

  return (
    <>
      {/* Desktop top bar */}
      <div className="hidden sm:block sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-lg">Meal Planner</div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/plan"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Plan
            </NavLink>

            <NavLink
              to="/meals/new"
              className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              + Add Meal
            </NavLink>

            <button
              type="button"
              onClick={doLogout}
              className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t">
        <div className="grid grid-cols-4 px-2 py-1">
          <Tab to="/dashboard" label="Home" icon="🏠" />
          <Tab to="/plan" label="Plan" icon="📅" />
          <Tab to="/meals/new" label="Add" icon="➕" />
          <button
            type="button"
            onClick={doLogout}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-gray-600"
          >
            <span className="text-lg leading-none">👤</span>
            <span className="text-xs font-medium">Account</span>
          </button>
        </div>
      </div>

      {/* Spacer so content doesn’t hide behind bottom nav on mobile */}
      <div className="sm:hidden h-16" />
    </>
  );
}
