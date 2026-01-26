import React from "react";
import { Link, Navigate } from "react-router-dom";

export default function Landing() {
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

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Simple meal planning for real life.
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            One less thing to think about.
          </p>

          <p className="mt-4 text-base leading-relaxed text-gray-700">
            Pick meals for the week in minutes. Keep it simple. Reduce daily decision fatigue.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 transition"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Create account
            </Link>
          </div>

          <ul className="mt-6 list-disc pl-5 text-sm leading-7 text-gray-600">
            <li>Plan in minutes</li>
            <li>Reuse favorites</li>
            <li>
              Grocery list <span className="text-gray-500">(coming later)</span>
            </li>
          </ul>
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
