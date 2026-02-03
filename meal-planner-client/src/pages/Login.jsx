// src/pages/Login.jsx
import { useContext, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("mealplanned · log in");

  const { login } = useContext(AuthContext);
  const { addToast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitHandler(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      await login(email, password);

      addToast({
        type: "success",
        title: "Welcome back",
        message: "You’re signed in.",
      });

      window.location.replace(next);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Couldn't sign in",
        message:
          err?.response?.data?.message ||
          "Check your email and password and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={submitHandler}
        className="bg-white p-6 rounded-[14px] border border-slate-100 shadow-sm w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold text-center">mealplanned</h1>
        <p className="text-sm text-gray-600 mb-5 text-center">
          Sign in to continue.
        </p>

        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Email
        </label>
        <input
          className="w-full px-3 py-2 mb-3 rounded-xl border border-slate-200"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Password
        </label>
        <div className="relative mb-4">
          <input
            className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          disabled={submitting}
          className="w-full rounded-[14px] bg-[rgb(127,155,130)] py-2.5 text-white font-semibold"
        >
          {submitting ? "Signing in…" : "Log in"}
        </button>

        <div className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <a
            className="underline"
            href={`/register?next=${encodeURIComponent(next)}`}
          >
            Create one
          </a>
        </div>
      </form>
    </div>
  );
}
