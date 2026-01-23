import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Profile from "./pages/Profile";

import CreateMeal from "./pages/CreateMeal";
import MealDetail from "./pages/MealDetail";
import EditMeal from "./pages/EditMeal";

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Default route */}
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
