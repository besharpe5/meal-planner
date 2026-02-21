import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../../src/services/api";

export default function Page() {
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "", success: false, invalidLink: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setStatus((s) => ({ ...s, invalidLink: true }));
    } else {
      setToken(t);
    }
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (form.password.length < 8) {
      setStatus((s) => ({ ...s, error: "Password must be at least 8 characters." }));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus((s) => ({ ...s, error: "Passwords don't match." }));
      return;
    }

    setStatus({ loading: true, error: "", success: false, invalidLink: false });

    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setStatus({ loading: false, error: "", success: true, invalidLink: false });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setStatus({ loading: false, error: msg, success: false, invalidLink: false });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-800">
      <div className="w-full max-w-md px-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <h1 className="text-2xl font-bold tracking-tight text-center">mealplanned</h1>

          {status.invalidLink ? (
            <>
              <p className="mt-4 text-gray-600 text-center">This reset link is invalid or missing.</p>
              <p className="mt-6 text-sm text-gray-600 text-center">
                <a href="/forgot-password" className="underline hover:text-[#7F9B82] transition-colors">
                  Request a new reset link
                </a>
              </p>
            </>
          ) : status.success ? (
            <>
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 text-center">
                Password reset! Redirecting to log in…
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-gray-600 text-center">Choose a new password.</p>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                {status.error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {status.error}
                  </div>
                ) : null}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1.5">New password</div>
                  <div className="flex items-center gap-2">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={onChange}
                      placeholder="At least 8 characters"
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

                <label className="block">
                  <div className="text-sm font-medium text-gray-700 mb-1.5">Confirm password</div>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:border-[#7F9B82] transition-colors"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-60 hover:bg-[#708c73] transition-colors"
                  style={{ backgroundColor: "#7F9B82" }}
                >
                  {status.loading ? "Resetting…" : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
