import UpgradePrompt from "../../src/components/UpgradePrompt";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f6f8f6] text-slate-800">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a href="/" className="text-sm text-slate-600 hover:text-[rgb(127,155,130)] hover:underline">
          ← Back to home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Upgrade to Premium</h1>
        <p className="mt-3 text-slate-600">
          Unlock unlimited meals, smarter suggestions, and a smoother weekly planning flow.
        </p>

        <div className="mt-8">
          <UpgradePrompt
            trigger="upgrade_page"
            title="Ready for a calmer planning routine?"
            description="Premium unlocks unlimited meals and smart suggestions tuned to your family."
            ctaText="Continue to Checkout"
          />
        </div>
      </div>
    </main>
  );
}