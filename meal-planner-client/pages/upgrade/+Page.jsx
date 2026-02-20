export default function Page() {
   const annualRegisterHref = "/register?plan=annual";
  const monthlyRegisterHref = "/register?plan=monthly";

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
              href={annualRegisterHref}
              className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#708c73]"
            >
              Start free trial
            </a>
          </div>
        </nav>

        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">One subscription for the whole household.</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-700">
            Premium unlocks unlimited meals, intelligent suggestions, and full planning history.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
            <article className="rounded-2xl border-2 border-[#7F9B82] bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md sm:p-7">
              <span className="inline-flex rounded-full bg-[#e7f3ea] px-3 py-1 text-xs font-semibold text-[#55745a]">Most popular</span>
              <p className="mt-4 text-4xl font-bold text-gray-900">$69</p>
              <p className="mt-1 text-base text-gray-600">/ year</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">Best value for uninterrupted planning.</p>
              <a
                href={annualRegisterHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#708c73]"
              >
                Start Annual Plan
              </a>
              <p className="mt-3 text-center text-xs text-gray-500">Cancel anytime.</p>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition-shadow hover:shadow-sm sm:p-7">
              <p className="text-3xl font-semibold text-gray-900">$7.99</p>
              <p className="mt-1 text-sm text-gray-600">/ month</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">Flexible monthly billing with the same Premium features.</p>
              <a
                href={monthlyRegisterHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                Start Monthly
              </a>
              <p className="mt-3 text-center text-xs text-gray-500">Cancel anytime.</p>
            </article>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Premium includes</h2>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>• Unlimited meals for your household</li>
            <li>• Smarter weekly suggestions based on your history</li>
            <li>• Full planning history</li>
            <li>• Shared planning for everyone in your family</li>
            <li>• Priority access to new features</li>
          </ul>
        </section>

        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Free vs Premium</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-125 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 pr-3 font-medium">Feature</th>
                  <th className="py-2 pr-3 font-medium">Free</th>
                  <th className="py-2 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-3">Active meals</td>
                  <td className="py-3 pr-3">12</td>
                  <td className="py-3">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-3">Planning history</td>
                  <td className="py-3 pr-3">Current week</td>
                  <td className="py-3">Full history</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-3">Smart suggestions</td>
                  <td className="py-3 pr-3">Limited</td>
                  <td className="py-3">Included</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-3">Household sharing</td>
                  <td className="py-3 pr-3">Included</td>
                  <td className="py-3">Included</td>
                </tr>
                <tr>
                  <td className="py-3 pr-3">Trial</td>
                  <td className="py-3 pr-3">14 days</td>
                  <td className="py-3">14 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

   <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-700 sm:text-base">
            <div>
              <h3 className="font-semibold text-gray-900">Does Premium cover my whole household?</h3>
              <p>Yes — Premium applies at the family level and covers all members in your household.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Can I cancel anytime?</h3>
              <p>Yes. You can cancel anytime in the billing portal. Access remains through the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Do you offer refunds?</h3>
              <p>Refunds are not guaranteed, but we&apos;re happy to help at <a className="text-[#5f7d63] underline" href="mailto:support@mealplanned.io">support@mealplanned.io</a>.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What happens after the trial?</h3>
              <p>You&apos;ll be moved to the free tier unless you upgrade.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Is monthly the same as annual?</h3>
              <p>Yes — same features. Annual is simply a better value.</p>
            </div>
          </div>
        </section>


   <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-gray-200 bg-white p-7 text-center sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Ready to choose your plan?</h2>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={annualRegisterHref}
              className="inline-flex items-center justify-center rounded-xl border border-[#7F9B82] bg-[#7F9B82] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#708c73]"
            >
              Start Annual Plan
            </a>
            <a
              href={monthlyRegisterHref}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Start Monthly
            </a>
          </div>
          <a href="/" className="mt-4 inline-flex text-sm font-medium text-[#5f7d63] hover:underline">
            Back to home
          </a>
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