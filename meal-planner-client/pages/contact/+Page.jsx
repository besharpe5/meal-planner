export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <nav className="mb-14 flex items-center justify-between border-b border-gray-200 pb-4">
          <a href="/" className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900">
            <img src="/favicon/favicon.svg" alt="MealPlanned logo" className="h-5 w-5" />
            mealplanned
          </a>
          <div className="flex items-center gap-4 sm:gap-5">
            <a href="/about" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
              About
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#708c73]"
            >
              Start free trial
            </a>
          </div>
        </nav>

        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">Contact MealPlanned</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700">
            Need help with billing, account access, or anything else? Reach our team at:
          </p>
          <p className="mt-5 text-xl font-semibold sm:text-2xl">
            <a href="mailto:support@mealplanned.io" className="underline transition-colors hover:text-[#5f7d63]">
              support@mealplanned.io
            </a>
          </p>
        </section>

        <footer className="mt-16 border-t border-gray-200 pt-8 pb-10 text-center text-sm text-gray-600">
          <p>© 2026 MealPlanned</p>
          <div className="mt-4 flex items-center justify-center gap-5">
            <a className="transition-colors hover:text-[#5f7d63] hover:underline" href="/privacy">
              Privacy
            </a>
            <a className="transition-colors hover:text-[#5f7d63] hover:underline" href="/about">
              About
            </a>
            <a className="transition-colors hover:text-[#5f7d63] hover:underline" href="/contact">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}