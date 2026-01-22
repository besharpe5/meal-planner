import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateMeal from "./pages/CreateMeal";
import EditMeal from "./pages/EditMeal";
import MealDetail from "./pages/MealDetail";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meals/new"
          element={
            <ProtectedRoute>
              <CreateMeal />
            </ProtectedRoute>
          }
        />

<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />


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


        {/* Default route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
