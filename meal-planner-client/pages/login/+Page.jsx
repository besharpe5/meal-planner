// pages/login/+Page.jsx
import { useState } from "react";
import api from "../../src/services/api";

export default function Page() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const res = await api.post("/auth/login", form);
      const token = res.data?.token;

      if (!token) throw new Error("Login succeeded but no token was returned.");

      // Client-only: this runs only after user submits
      localStorage.setItem("token", token);

      // Send them into the guarded app
      window.location.href = "/app/dashboard";
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
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-md px-5 py-14">
        <a href="/" className="text-sm hover:underline text-gray-600">
          ← Back to home
        </a>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Log in</h1>
        <p className="mt-2 text-gray-700">
          Welcome back. Let’s get dinner decisions out of the way.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {status.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {status.error}
            </div>
          ) : null}

          <label className="block">
            <div className="text-sm font-medium">Email</div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium">Password</div>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              required
            />
          </label>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#7F9B82" }}
          >
            {status.loading ? "Logging in…" : "Log in"}
          </button>

          <p className="text-sm text-gray-700 text-center">
            New here?{" "}
            <a className="underline" href="/register">
              Create an account
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
