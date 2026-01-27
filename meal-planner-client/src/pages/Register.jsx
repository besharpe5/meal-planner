import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Register() {
  useDocumentTitle("MealPlanned | Create Account");
  const { register } = useContext(AuthContext);
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
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={submitHandler}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Create Account</h1>

        <input
          name="name"                 // ✅ MUST be "name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={onChange}
          autoComplete="name"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          name="email"                // ✅ MUST be "email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          name="password"             // ✅ MUST be "password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          autoComplete="new-password"
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white rounded-lg py-2 font-semibold hover:bg-green-600 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
