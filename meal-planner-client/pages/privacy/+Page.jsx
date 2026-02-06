// pages/privacy/+Page.jsx
export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-2xl px-5 py-20">
        <a href="/" className="text-sm text-gray-600 hover:underline hover:text-[#7F9B82] transition-colors">
          ← Back to home
        </a>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-8 text-gray-700 leading-relaxed">
          MealPlanned stores your account information and meal-planning data so
          the service can function.
        </p>

        <p className="mt-5 text-gray-700 leading-relaxed">
          We do not sell your personal information. Your data is only used to
          provide core features like saving meals, generating plans, and
          tracking serves.
        </p>

        <p className="mt-5 text-gray-700 leading-relaxed">
          If you would like your data deleted, please contact us and we'll take
          care of it.
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Contact:{" "}
          <a
            href="mailto:support@mealplanned.io"
            className="underline hover:text-[#7F9B82] transition-colors"
          >
            support@mealplanned.io
          </a>
        </p>
      </div>
    </main>
  );
}
