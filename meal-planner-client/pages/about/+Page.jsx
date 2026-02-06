// pages/about/+Page.jsx
export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to home
        </a>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          About MealPlanned
        </h1>

        <p className="mt-6 text-gray-700 leading-relaxed">
          MealPlanned exists to reduce decision fatigue around dinner.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          Instead of planning meals every single night, you decide once, reuse
          what works, and move on with your life.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          It’s built for real life — busy weeks, repeat favorites, and the
          occasional “we’ll just figure it out” night.
        </p>

        <p className="mt-6 text-gray-700 leading-relaxed">
          This project started as a family tool and grew into something worth
          sharing.
        </p>
      </div>
    </main>
  );
}
