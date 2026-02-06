// pages/privacy/+Page.jsx
export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to home
        </a>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-6 text-gray-700 leading-relaxed">
          MealPlanned stores your account information and meal-planning data so
          the service can function.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          We do not sell your personal information. Your data is only used to
          provide core features like saving meals, generating plans, and
          tracking serves.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          If you would like your data deleted, please contact us and we’ll take
          care of it.
        </p>

        <p className="mt-6 text-sm text-gray-500">
          Contact:{" "}
          <a
            href="mailto:support@mealplanned.io"
            className="underline"
          >
            support@mealplanned.io
          </a>
        </p>
      </div>
    </main>
  );
}
