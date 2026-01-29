import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function About() {
  useDocumentTitle("MealPlanned — About");
  const year = new Date().getFullYear();
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;

  const contactEmail = "you@email.com"; // TODO: replace

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <main className="flex-1 px-5 py-14">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="mb-4 font-semibold tracking-[-0.02em] text-gray-900"
            >
              mealplanned
            </Link>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
              >
                Create account
              </Link>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight">
            About MealPlanned
          </h1>

          <p className="mt-6 text-base leading-relaxed text-gray-700">
            MealPlanned exists because planning meals sounds simple—until you
            actually have to do it.
          </p>

          <p className="mt-4 text-base leading-relaxed text-gray-700">
            I like cooking. I care about eating well. But when I’m asked to plan
            meals ahead of time, my brain doesn’t always cooperate. Too many
            options. Too many decisions. Suddenly something small feels
            overwhelming.
          </p>

          <p className="mt-4 text-base leading-relaxed text-gray-700">
            So I built MealPlanned to handle that part. Not to tell you what you{" "}
            <span className="italic">should</span> eat. Not to optimize your
            life. Just to make food decisions lighter—so you can enjoy the parts
            that matter.
          </p>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-900">
              MealPlanned is for people who:
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm leading-7 text-gray-700">
              <li>Care about good food</li>
              <li>Don’t want planning to be a hobby</li>
              <li>Feel decision fatigue (with or without ADHD)</li>
              <li>Want structure without pressure</li>
            </ul>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Built for real life. Made to be easier.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/register"
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
  "
            >
              Get started
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-gray-500">
          <div>© {year} MealPlanned</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-700 transition">
              Privacy
            </Link>
            <Link to="/about" className="hover:text-gray-700 transition">
              About
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
