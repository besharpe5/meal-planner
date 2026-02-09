// pages/login/+Page.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../../src/services/api";

function getSafeNext(fallback = "/app/dashboard") {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || fallback;
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  return next;
}

export default function Page() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const next = getSafeNext();

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      await api.post("/auth/login", form);

      // Flag for client-side guards (not a token, just a hint)
      try { localStorage.setItem("auth_flag", "1"); } catch { /* ignore */ }
      window.location.href = next;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";
      setStatus({ loading: false, error: msg });
      return;
    }

    setStatus({ loading: false, error: "" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-800">
      <div className="w-full max-w-md px-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <h1 className="text-2xl font-bold tracking-tight text-center">
            mealplanned
          </h1>
          <p className="mt-2 text-gray-600 text-center">
            Sign in to continue.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {status.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {status.error}
              </div>
            ) : null}

            <label className="block">
              <div className="text-sm font-medium text-gray-700 mb-1.5">Email</div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:border-[#7F9B82] transition-colors"
                required
              />
            </label>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1.5">Password</div>
              <div className="flex items-center gap-2">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange}
                  className="flex-1 min-w-0 rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:border-[#7F9B82] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-60 hover:bg-[#708c73] transition-colors"
              style={{ backgroundColor: "#7F9B82" }}
            >
              {status.loading ? "Logging in…" : "Log in"}
            </button>

            <p className="text-sm text-gray-600 text-center pt-2">
              Don't have an account?{" "}
              <a className="underline hover:text-[#7F9B82] transition-colors" href={`/register?next=${encodeURIComponent(next)}`}>
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
