import { useContext, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function getNextUrl() {
  if (typeof window === "undefined") return "/app/dashboard";
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (!next) return "/app/dashboard";
  if (!next.startsWith("/")) return "/app/dashboard";
  if (!next.startsWith("/app")) return "/app/dashboard";
  return next;
}

export default function Register() {
  useDocumentTitle("mealplanned · create account");
  const { register, ready, isAuthenticated, loading } = useContext(AuthContext);
  const { addToast } = useToast();

  const nextUrl = useMemo(() => getNextUrl(), []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // If already authed, bounce into the app
  if (ready && isAuthenticated) {
    window.location.replace(nextUrl);
    return null;
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await register(form.name, form.email, form.password);

      addToast({
        type: "success",
        title: "Account created",
        message: "Welcome — you’re signed in.",
      });

      window.location.replace(nextUrl);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Registration failed",
        message: err?.message || "We couldn't create your account. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={submitHandler}
        className="bg-white p-6 rounded-[14px] border border-slate-100 shadow-sm w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-1 text-center">
          Create account
        </h1>
        <p className="text-sm text-gray-600 mb-5 text-center">
          A calmer way to plan meals.
        </p>

        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Name
        </label>
        <input
          name="name"
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={onChange}
          autoComplete="name"
          className="w-full px-3 py-2 mb-3 rounded-xl border border-slate-200 bg-white text-sm outline-none
                     focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
          required
        />

        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          className="w-full px-3 py-2 mb-3 rounded-xl border border-slate-200 bg-white text-sm outline-none
                     focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
          required
        />

        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Password
        </label>
        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            className="w-full px-3 py-2 pr-11 rounded-xl border border-slate-200 bg-white text-sm outline-none
                       focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
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
          type="submit"
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
        >
          {!ready ? "Loading..." : loading ? "Creating..." : "Create account"}
        </button>

        <div className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a className="text-slate-900 underline underline-offset-4" href="/login">
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}
