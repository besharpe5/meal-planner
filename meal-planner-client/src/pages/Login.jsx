import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("mealplanned · log in");
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
        title: "Welcome back",
        message: "You’re signed in.",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      addToast({
        type: "error",
        title: "Couldn't sign in",
        message:
          err?.response?.data?.message || "Check your email and password and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <div className="max-w-sm mx-auto p-4 flex min-h-screen items-center">
    <form
      onSubmit={submitHandler}
      className="w-full bg-white p-6 rounded-[14px] border border-slate-100 shadow-sm"
    >
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-center">
        mealplanned
      </h1>
      <p className="text-sm text-gray-600 mt-1 mb-5 text-center">
        Sign in to continue.
      </p>

      <label className="block text-xs font-semibold text-slate-500 mb-1">
        Email
      </label>
      <input
        className="w-full px-3 py-2 mb-3 rounded-xl border border-slate-200 bg-white text-sm outline-none
                   focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <label className="block text-xs font-semibold text-slate-500 mb-1">
        Password
      </label>
      <input
        className="w-full px-3 py-2 mb-4 rounded-xl border border-slate-200 bg-white text-sm outline-none
                   focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <button
        disabled={submitting}
        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white
                   transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
      >
        {submitting ? "Signing in..." : "Log in"}
      </button>

      <div className="mt-4 text-sm text-center text-gray-600">
        Don’t have an account?{" "}
        <Link className="text-slate-900 underline underline-offset-4" to="/register">
          Create one
        </Link>
      </div>
    </form>
  </div>
</div>

  );
}
