import React, { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Landing() {
  useDocumentTitle("MealPlanned — Decide once. Eat well. Move on.");

  const year = useMemo(() => new Date().getFullYear(), []);
  const contactEmail = "you@email.com"; // TODO: replace

  const { ready, isAuthenticated } = useContext(AuthContext);

  // ⛔️ Do nothing until auth state is initialized
  if (!ready) return null;

  // ✅ Public page → app router (basename="/app"): use a hard redirect to avoid basename confusion
  if (isAuthenticated) {
    window.location.replace("/app/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <main className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-2xl">
          <div className="mb-4 font-semibold tracking-[-0.02em] text-gray-900">
            mealplanned
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.1]">
            Decide once.{" "}
            <span className="underline underline-offset-8 decoration-[rgba(127,155,130,0.35)]">
              Eat well.
            </span>{" "}
            Move on.
          </h1>

          <p className="mt-4 text-lg text-gray-700">
            MealPlanned keeps your meal rotation in check—without turning
            planning into a mental chore.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            For tired brains, busy lives, and people who still care about good
            food.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/register"
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
            </a>

            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              Log in
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Start with dinner today. Add breakfast, lunch, and snacks when
            you’re ready.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Pick once, reuse what works, and let the plan carry you through the
            week.
          </p>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-gray-500">
          <p className="mb-3 text-gray-500">
            MealPlanned is a small, independent product — feedback is always
            welcome.
          </p>

          <div>© {year} MealPlanned</div>

          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-gray-700 transition">
              Privacy
            </a>
            <a href="/about" className="hover:text-gray-700 transition">
              About
            </a>
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
