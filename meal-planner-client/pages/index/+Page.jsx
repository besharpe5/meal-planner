export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <header className="text-base font-medium tracking-tight mb-24 text-[#7F9B82]">
          mealplanned
        </header>

        <section className="mt-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Decide once. <span className="underline underline-offset-8 decoration-[rgba(127,155,130,0.35)]">Eat well.</span> Move on.
          </h1>

          <p className="mt-6 text-lg text-gray-700 max-w-2xl leading-relaxed">
            MealPlanned keeps your meal rotation in check—without turning planning into a mental chore.
          </p>

          <p className="mt-5 text-base text-gray-600 max-w-2xl">
            For tired brains, busy lives, and people who still care about good food.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="/register"
              className="inline-flex justify-center px-5 py-3 rounded-xl font-semibold text-white hover:bg-[#708c73] transition-colors"
              style={{ backgroundColor: "#7F9B82" }}
            >
              Get started
            </a>
            <a
              href="/login"
              className="inline-flex justify-center px-5 py-3 rounded-xl font-semibold border-2 border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Log in
            </a>
          </div>

          <div className="mt-12 space-y-5 text-gray-700">
            <p>
              Start with dinner today. Add breakfast, lunch, and snacks when you're ready.
            </p>
            <p>
              Pick once, reuse what works, and let the plan carry you through the week.
            </p>
          </div>
        </section>

        <footer className="mt-24 pb-12">
          <p className="text-sm text-gray-600 mb-5">
            MealPlanned is a small, independent product — feedback is always welcome.
          </p>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>© 2026 MealPlanned</div>
            <div className="flex gap-4">
              <a className="hover:underline hover:text-[#7F9B82] transition-colors" href="/privacy">
                Privacy
              </a>
              <a className="hover:underline hover:text-[#7F9B82] transition-colors" href="/about">
                About
              </a>
              <a className="hover:underline hover:text-[#7F9B82] transition-colors" href="/contact">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
