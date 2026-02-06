// pages/register/+Page.jsx
import { useState } from "react";
import api from "../../src/services/api";

export default function Page() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const res = await api.post("/auth/register", form);

      // Many APIs return token on register; if yours doesn't, we’ll handle it.
      const token = res.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "/app/dashboard";
        return;
      }

      // No token returned: send them to login (account should exist now)
      window.location.href = "/login";
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      setStatus({ loading: false, error: msg });
      return;
    } finally {
      setStatus((s) => ({ ...s, loading: false }));
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-md px-5 py-14">
        <a href="/" className="text-sm hover:underline text-gray-600">
          ← Back to home
        </a>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-gray-700">
          Plan faster, repeat the good stuff, and move on with your night.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {status.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {status.error}
            </div>
          ) : null}

          <label className="block">
            <div className="text-sm font-medium">Name</div>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              required
            />
          </label>

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
              autoComplete="new-password"
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
            {status.loading ? "Creating…" : "Create account"}
          </button>

          <p className="text-sm text-gray-700 text-center">
            Already have an account?{" "}
            <a className="underline" href="/login">
              Log in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
