// src/pages/Register.jsx
import { useContext, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function getSafeNext(fallback = "/app/dashboard") {
  if (typeof window === "undefined") return fallback;

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || fallback;

  // Only allow internal paths
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/")) return fallback;

  return next;
}

export default function Register() {
  useDocumentTitle("mealplanned · create account");

  const { register } = useContext(AuthContext);
  const { addToast } = useToast();

  const next = useMemo(() => getSafeNext("/app/dashboard"), []);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submitHandler(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      await register(form.name, form.email, form.password);

      addToast({
        type: "success",
        title: "Account created",
        message: "Welcome — you’re signed in.",
      });

      window.location.replace(next);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Registration failed",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "We couldn't create your account.",
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
        <h1 className="text-2xl font-semibold text-center mb-1">
          Create account
        </h1>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={onChange}
          autoComplete="name"
          className="w-full mb-3 px-3 py-2 rounded-xl border"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          className="w-full mb-3 px-3 py-2 rounded-xl border"
          required
        />

        <div className="flex items-center gap-2 mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="shrink-0 text-gray-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[14px] bg-[rgb(127,155,130)] py-2.5 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>

        <div className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <a className="underline" href={`/login?next=${encodeURIComponent(next)}`}>
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}
