import { useDocumentTitle } from "../hooks/useDocumentTitle";
export default function Privacy() {
  useDocumentTitle("MealPlanned — Privacy");
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-semibold tracking-[-0.02em]">Privacy</h1>


        <p className="mt-4 text-gray-700 leading-relaxed">
        MealPlanned stores your account and meal-planning data only to provide the service.
        We don’t sell your personal information. You can contact us at any time to request data deletion.

        </p>
      </div>
    </div>
  );
}
