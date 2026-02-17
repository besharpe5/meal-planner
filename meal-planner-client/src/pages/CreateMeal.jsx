import { useEffect, useRef, useState } from "react";
import { Link } from "../components/Link";
import { navigate } from "vike/client/router";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import UpgradePrompt from "../components/UpgradePrompt";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function CreateMeal() {
  useDocumentTitle("mealplanned · new meal");
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    notes: "",
    rating: 0,
  });

  const [saving, setSaving] = useState(false);
  const [createdFeedback, setCreatedFeedback] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const feedbackTimeout = useRef(null);
  const navigateTimeout = useRef(null);

  useEffect(
    () => () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      if (navigateTimeout.current) {
        clearTimeout(navigateTimeout.current);
      }
    },
    []
  );

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      addToast({
        type: "error",
        title: "Missing name",
        message: "Please enter a meal name.",
      });
      return;
    }

    setLimitReached(false);
    setSaving(true);

    try {
      await API.post("/meals", {
        name: form.name.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        rating: form.rating,
      });

      setCreatedFeedback(true);
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      if (navigateTimeout.current) {
        clearTimeout(navigateTimeout.current);
      }
      feedbackTimeout.current = setTimeout(() => setCreatedFeedback(false), 1500);
      navigateTimeout.current = setTimeout(() => navigate("/app/dashboard"), 1500); 
    } catch (err) {
      console.error(err);
      
      if (err?.response?.data?.code === "MEAL_LIMIT_REACHED") {
        setLimitReached(true);
      } else {
        addToast({
          type: "error",
          title: "Create failed",
          message: err?.response?.data?.message || "Failed to create meal.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Meal</h1>
          <Link to="/app/dashboard" className="text-blue-700 hover:underline">
            Back
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
            {limitReached ? (
            <div className="space-y-3">
              <UpgradePrompt
                trigger="meal_limit"
                title="You've reached the free meal limit"
                description="Upgrade to Premium for unlimited meals + smart suggestions for your whole family."
                upgradeHref="/app/upgrade"
                variant="modal"
              />
              <Link
                to="/app/dashboard"
                className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Meal name *</label>
              <input
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., Taco Night"
                value={form.name}
                onChange={onChange("name")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                value={form.description}
                onChange={onChange("description")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded-lg p-2 min-h-22.5 focus:ring-2 focus:ring-blue-400"
                value={form.notes}
                onChange={onChange("notes")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="border rounded-lg p-2">
                <StarRating
                  value={form.rating}
                  onChange={(n) =>
                    setForm((prev) => ({ ...prev, rating: n }))
                  }
                />
              </div>
            </div>


            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/app/dashboard")}
                className="w-1/2 border rounded-lg py-2 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>

              <div className="flex w-1/2 flex-col items-center">
                <button
                  type="submit"
                  className="w-full bg-slate-600 text-white rounded-lg py-2 hover:bg-slate-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create"}
                </button>
                {createdFeedback && (
                  <span className="mt-1 text-xs font-medium text-green-600">
                    Saved ✓
                  </span>
                )}
              </div> 
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
