import { useContext, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function getNextUrl() {
  if (typeof window === "undefined") return "/app/dashboard";
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");

  // Only allow internal redirects
  if (!next) return "/app/dashboard";
  if (!next.startsWith("/")) return "/app/dashboard";
  if (!next.startsWith("/app")) return "/app/dashboard";

  return next;
}

export default function Login() {
  useDocumentTitle("mealplanned · log in");
  const { login, ready, isAuthenticated, loading } = useContext(AuthContext);
  const { addToast } = useToast();

  const nextUrl = useMemo(() => getNextUrl(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already authed, bounce into the app (only after auth init)
  if (ready && isAuthenticated) {
    window.location.replace(nextUrl);
    return null;
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);

      addToast({
        type: "success",
        title: "Welcome back",
        message: "You’re signed in.",
      });

      // Cross into /app router (basename="/app") reliably
      window.location.replace(nextUrl);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Couldn't sign in",
        message: err?.message || "Check your email and password and try again.",
      });
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
          <div className="relative mb-4">
            <input
              className="w-full px-3 py-2 pr-11 rounded-xl border border-slate-200 bg-white text-sm outline-none
                         focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            disabled={!ready || loading}
            className="
              inline-flex items-center justify-center
              rounded-[14px]
              bg-[rgb(127,155,130)]
              px-4 py-2.5
              text-sm font-semibold text-white
              transition
              hover:bg-[rgb(113,138,116)]
              focus:outline-none
              focus:ring-4 focus:ring-[rgba(127,155,130,0.35)]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            type="submit"
          >
            {!ready ? "Loading..." : loading ? "Signing in..." : "Log in"}
          </button>

          <div className="mt-4 text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <a
              className="text-slate-900 underline underline-offset-4"
              href="/register"
            >
              Create one
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
