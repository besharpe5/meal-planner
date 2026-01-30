import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Profile from "./pages/Profile";

import CreateMeal from "./pages/CreateMeal";
import MealDetail from "./pages/MealDetail";
import EditMeal from "./pages/EditMeal";

import { useDocumentTitle } from "./hooks/useDocumentTitle";

export default function App() {
  useDocumentTitle("mealplanned");

  return (
    <BrowserRouter basename="/app">
      <Navbar />

      <div className="pb-20 md:pb-0">
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

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

          {/* 404 inside app */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
