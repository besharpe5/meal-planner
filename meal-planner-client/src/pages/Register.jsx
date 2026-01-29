import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Register() {
  useDocumentTitle("mealplanned · create account");
  const { register } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value, // ✅ updates the correct key without ever turning form into a string
    }));
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    // quick sanity check
    console.log("Submitting:", form);

    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Registration failed",
        message:
          err?.response?.data?.message ||
          "We couldn't create your account. Please try again.",
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
    <input
      name="password"
      type="password"
      placeholder="Create a password"
      value={form.password}
      onChange={onChange}
      autoComplete="new-password"
      className="w-full px-3 py-2 mb-4 rounded-xl border border-slate-200 bg-white text-sm outline-none
                 focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]"
      required
    />

    <button
      type="submit"
      className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white
                 transition hover:bg-slate-800"
    >
      Create account
    </button>

    <div className="mt-4 text-sm text-center text-gray-600">
      Already have an account?{" "}
      <Link className="text-slate-900 underline underline-offset-4" to="/login">
        Log in
      </Link>
    </div>
  </form>
</div>

  );
}
