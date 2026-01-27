import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Privacy from "./pages/Privacy";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Profile from "./pages/Profile";

import CreateMeal from "./pages/CreateMeal";
import MealDetail from "./pages/MealDetail";
import EditMeal from "./pages/EditMeal";

import { useDocumentTitle } from "./hooks/useDocumentTitle";

export default function App() {
  // Optional: a default title (pages like Plan can override it)
  useDocumentTitle("MealPlanned");

  return (
    <Router>
      <Navbar />

      {/* Bottom padding on mobile so fixed bottom nav doesn't cover content */}
      <div className="pb-20 md:pb-0">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <Plan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Meals */}
          <Route
            path="/meals/new"
            element={
              <ProtectedRoute>
                <CreateMeal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meals/:id"
            element={
              <ProtectedRoute>
                <MealDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meals/:id/edit"
            element={
              <ProtectedRoute>
                <EditMeal />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
