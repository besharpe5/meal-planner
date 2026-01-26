import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Landing() {
  useDocumentTitle("MealPlanned | Decide once. Eat well. Move on.");
  const year = new Date().getFullYear();

  // If user is already logged in, skip landing
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;

  const contactEmail = "you@email.com"; // TODO: replace

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <main className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-2xl">
          <div className="mb-4 font-extrabold tracking-tight text-gray-900">
            MealPlanned
          </div>

          {/* HERO */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Decide once. Eat well. Move on.
          </h1>

          {/* SUBHEAD */}
          <p className="mt-4 text-lg text-gray-700">
            MealPlanned helps you keep a good meal rotation—without turning
            planning into a mental chore.
          </p>

          {/* MICRO-LINE */}
          <p className="mt-3 text-sm text-gray-500">
            For tired brains, busy lives, and people who still care about good food.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 transition"
            >
              Get started
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Log in
            </Link>
          </div>

          {/* GENTLE FUTURE-PROOF LINE */}
          <p className="mt-6 text-sm text-gray-600">
            Start with dinner today. Add breakfast, lunch, and snacks when you’re ready.
          </p>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-gray-500">
          <div>© {year} MealPlanned</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-700 transition">
              Privacy
            </Link>
            <a
              href={`mailto:${contactEmail}`}
              className="hover:text-gray-700 transition"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
