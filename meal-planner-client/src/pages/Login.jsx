// src/pages/Login.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("MealPlanned | Login");
  const { login } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);

      addToast({
        type: "success",
        title: "Welcome back!",
        message: "You’re signed in.",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      addToast({
        type: "error",
        title: "Login failed",
        message:
          err?.response?.data?.message || "Check your email and password and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-sm mx-auto p-4 flex min-h-screen items-center">
        <form
          onSubmit={submitHandler}
          className="w-full bg-white p-6 rounded-xl shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-1 text-center">Meal Planner</h1>
          <p className="text-sm text-gray-600 mb-5 text-center">
            Sign in to your family account
          </p>

          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            type="submit"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>

          <div className="mt-4 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link className="text-blue-700 hover:underline" to="/register">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
