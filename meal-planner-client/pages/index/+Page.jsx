import { useEffect } from "react";

const howItWorksCards = [
  {
    step: "1",
    title: "Build your meal library",
    body: "Add the meals your household already enjoys. Rate them, add notes, and MealPlanned will remember how often you serve each one.",
  },
  {
    step: "2",
    title: "Plan your week in minutes",
    body: "Assign meals to each day, plan leftovers, or let MealPlanned suggest what to make based on your preferences and recent history.",
  },
  {
    step: "3",
    title: "Track what you actually serve",
    body: "Plans change, and that’s okay! Mark meals as served to automatically update your meal history and improve future suggestions.",
  },
  {
    step: "4",
    title: "Plan together as a household",
    body: "Invite your partner, family members, or roommates to collaborate on the same weekly plan, all within one shared space.",
  },
  {
    step: "5",
    title: "Upgrade when you need more",
    body: "Free households can manage a small meal library and plan their current week. Premium unlocks unlimited meals, intelligent suggestions, and full planning history.",
  },
];

function FadeInSection({ className = "", children }) {
  return (
    <section
      data-fade
      className={`opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${className}`}
    >
      {children}
    </section>
  );
}

export default function Page() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("!opacity-100", "!translate-y-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll("[data-fade]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <nav className="mb-14 flex items-center justify-between border-b border-gray-200 pb-4">
          <a href="/" className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900">
            <img src="/favicon/favicon.svg" alt="MealPlanned logo" className="h-5 w-5" />
            mealplanned
          </a>
          <div className="flex items-center gap-4 sm:gap-5">
            <a href="/login" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
              Log in
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#708c73]"
            >
              Start free trial
            </a>
          </div>
        </nav>

        <FadeInSection className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl leading-tight">
            Decide once. Eat well. <span className="underline underline-offset-8 decoration-[rgba(127,155,130,0.45)]">Move on.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700">
            A calmer way to plan dinner for your entire household.
          </p>
          <div className="mt-10">
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#708c73]"
            >
              Start your free trial
            </a>
          </div>
        </FadeInSection>

        <FadeInSection className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-lg text-gray-700">
            Built for couples, families, and anyone tired of deciding what&apos;s for dinner every night.
          </p>
        </FadeInSection>

        <FadeInSection className="mt-20 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Dinner isn&apos;t hard. Deciding every night is.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-700">
            You already know what your household likes. But without a plan, the same meals repeat, leftovers go unused, and someone has to decide... again.
          </p>
        </FadeInSection>

        <FadeInSection className="mt-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">How MealPlanned works</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-gray-700">
            A simple weekly system that turns &quot;what&apos;s for dinner?&quot; into a plan you can trust.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {howItWorksCards.map((card, idx) => (
              <article
                key={card.step}
                className={`rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md ${
                  idx === 4 ? "md:col-span-2" : ""
                } ${idx % 2 === 1 ? "md:translate-y-6" : ""} text-left`}
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-900">
                    {card.step}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{card.title}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-gray-700">{card.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection className="mt-20 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Plans change.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-700">
            Mark what you actually served and future suggestions adjust automatically to avoid repetition and keep your meal rotation fresh.
          </p>
        </FadeInSection>

        <FadeInSection className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">One subscription covers your entire household.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-700">
            Invite your partner, family members, or roommates and plan together in the same weekly view.
          </p>
        </FadeInSection>

        <FadeInSection className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Start with a free trial</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-700">
            Free households can build a small meal library and plan the current week. Premium unlocks unlimited meals, smarter suggestions, and full planning history.
          </p>
          <a href="/upgrade" className="mt-5 inline-flex text-base font-semibold text-[#5f7d63] hover:underline">
            View pricing →
          </a>
        </FadeInSection>

        <FadeInSection className="mt-20 rounded-2xl border border-gray-200 bg-white p-8 pb-20 text-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-7 py-3 text-base font-semibold text-white transition-all hover:bg-[#708c73]"
          >
            Start free trial
          </a>
          <div className="mt-8 space-y-2 text-gray-600">
            <p>No ads.</p>
            <p>Plan when it helps — not because you have to.</p>
            <p>Just a calmer way to decide what&apos;s for dinner.</p>
          </div>
        </FadeInSection>

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
