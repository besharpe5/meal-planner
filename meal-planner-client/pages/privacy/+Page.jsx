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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">Privacy Policy</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700">
            We keep privacy simple: collect only what MealPlanned needs to run, never sell personal data, and give you a clear way to request deletion.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">What we store</h2>
          <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
            MealPlanned stores account details and meal-planning data (like meals, plans, ratings, and household membership) so core features work reliably across devices.
          </p>
        </section>

        <section className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold tracking-tight">How data is used</h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Your data is used to provide core product functionality: saving meals, building weekly plans, tracking what was served, and supporting household collaboration.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold tracking-tight">What we don’t do</h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We do not sell your personal information. We avoid collecting unnecessary information and focus on what is required to operate MealPlanned.
            </p>
          </article>
        </section>

        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Data deletion requests</h2>
          <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
            If you want your data removed, email us and we&apos;ll process your deletion request.
          </p>
          <p className="mt-5 text-sm text-gray-600 sm:text-base">
            Contact: {" "}
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
