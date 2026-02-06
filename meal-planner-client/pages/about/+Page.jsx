// pages/about/+Page.jsx
export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-2xl px-5 py-20">
        <a href="/" className="text-sm text-gray-600 hover:underline hover:text-[#7F9B82] transition-colors">
          ← Back to home
        </a>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          About MealPlanned
        </h1>

        <p className="mt-8 text-gray-700 leading-relaxed">
          MealPlanned exists to reduce decision fatigue around dinner.
        </p>

        <p className="mt-5 text-gray-700 leading-relaxed">
          Instead of planning meals every single night, you decide once, reuse
          what works, and move on with your life.
        </p>

        <p className="mt-5 text-gray-700 leading-relaxed">
          It's built for real life — busy weeks, repeat favorites, and the
          occasional "we'll just figure it out" night.
        </p>

        <p className="mt-8 text-gray-700 leading-relaxed">
          This project started as a family tool and grew into something worth
          sharing.
        </p>
      </div>
    </main>
  );
}
