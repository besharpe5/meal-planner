export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <header className="flex items-center justify-between">
          <div className="font-extrabold tracking-tight text-xl">
            MealPlanned
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a className="hover:underline" href="/about">
              About
            </a>
            <a className="hover:underline" href="/privacy">
              Privacy
            </a>
            <a className="px-3 py-2 rounded-lg border hover:bg-gray-50" href="/login">
              Log in
            </a>
          </nav>
        </header>

        <section className="mt-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Decide once. <br className="hidden sm:block" />
            Eat well. Move on.
          </h1>

          <p className="mt-5 text-lg text-gray-700 max-w-2xl leading-relaxed">
            MealPlanned helps you plan dinners fast, reuse favorites, and reduce the
            daily “what’s for dinner?” spiral.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/register"
              className="inline-flex justify-center px-5 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "#7F9B82" }}
            >
              Get started
            </a>
            <a
              href="/login"
              className="inline-flex justify-center px-5 py-3 rounded-xl font-semibold border hover:bg-gray-50"
            >
              I already have an account
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <div className="font-semibold">Fill your week</div>
              <p className="mt-1 text-sm text-gray-700">
                Auto-suggest dinners based on your filters and favorites.
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="font-semibold">Serve tracking</div>
              <p className="mt-1 text-sm text-gray-700">
                Mark meals served so repeats feel intentional, not accidental.
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="font-semibold">Real-life simple</div>
              <p className="mt-1 text-sm text-gray-700">
                Less planning overhead. More “done.”
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-20 pb-10 text-sm text-gray-600 flex gap-4">
          <a className="hover:underline" href="/privacy">
            Privacy
          </a>
          <a className="hover:underline" href="/about">
            About
          </a>
        </footer>
      </div>
    </main>
  );
}
