import { useState } from "react";
import api from "../../src/services/api";

export default function Page() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", submitted: false });

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", submitted: false });

    try {
      await api.post("/auth/forgot-password", { email });
      setStatus({ loading: false, error: "", submitted: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setStatus({ loading: false, error: msg, submitted: false });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-800">
      <div className="w-full max-w-md px-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <h1 className="text-2xl font-bold tracking-tight text-center">mealplanned</h1>

          {status.submitted ? (
            <>
              <p className="mt-4 text-gray-600 text-center">Check your inbox.</p>
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 text-center">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
              </div>
              <p className="mt-6 text-sm text-gray-600 text-center">
                <a href="/login" className="underline hover:text-[#7F9B82] transition-colors">
                  Back to log in
                </a>
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-gray-600 text-center">
                Enter your email and we'll send you a reset link.
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
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                  {status.loading ? "Sending…" : "Send reset link"}
                </button>

                <p className="text-sm text-gray-600 text-center pt-2">
                  Remember your password?{" "}
                  <a href="/login" className="underline hover:text-[#7F9B82] transition-colors">
                    Log in
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
