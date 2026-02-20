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
            <a href="/upgrade" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
              Upgrade
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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">About MealPlanned</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700">
            MealPlanned exists to make dinner feel lighter: fewer nightly decisions, less mental load, and a weekly plan your whole household can trust.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Why we built this</h2>
          <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
            Planning dinner every single night is exhausting, especially when family schedules are full and everyone has opinions. We built MealPlanned so you can decide once, save what works, and stop restarting from scratch each evening.
          </p>
        </section>

        <section className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold tracking-tight">Built for real households</h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              MealPlanned is designed for busy weeks, repeat favorites, leftovers, and those imperfect days when plans shift. It supports the way people actually eat, not an idealized routine.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold tracking-tight">Shared by default</h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Couples, families, and roommates can plan in one shared space. Everyone stays on the same page without group-chat chaos or last-minute guesswork.
            </p>
          </article>
        </section>

        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 text-center sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">From family tool to shared product</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-700 sm:text-lg">
            MealPlanned started as a simple internal tool for our own household. Once it consistently made weeknights calmer, we turned it into a product so other households could get the same relief.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#708c73]"
            >
              Start your free trial
            </a>
            <a
              href="/upgrade"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              View plans
            </a>
          </div>
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
