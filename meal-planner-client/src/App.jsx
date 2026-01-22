// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout / routing
import ProtectedRoute from "./routes/ProtectedRoute";
import NavBar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateMeal from "./pages/CreateMeal";
import EditMeal from "./pages/EditMeal";
import MealDetail from "./pages/MealDetail";
import Plan from "./pages/Plan";

/**
 * Layout wrapper for authenticated pages
 * NavBar appears only here
 */
function AppLayout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Plan />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/meals/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateMeal />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/meals/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MealDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/meals/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EditMeal />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
