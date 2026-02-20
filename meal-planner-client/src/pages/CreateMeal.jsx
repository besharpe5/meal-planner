import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "../components/Link";
import { navigate } from "vike/client/router";
import API from "../services/api";
import { getMeals } from "../services/mealService";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import UpgradePrompt from "../components/UpgradePrompt";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { AuthContext } from "../context/authContext";
import { isRestrictedFreeUser } from "../utils/access";

export default function CreateMeal() {
  useDocumentTitle("mealplanned · new meal");
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    description: "",
    notes: "",
    rating: 0,
  });

  const [saving, setSaving] = useState(false);
  const [createdFeedback, setCreatedFeedback] = useState(false);
  const [showPostCreatePrompt, setShowPostCreatePrompt] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [mealCount, setMealCount] = useState(0);
  const FREE_TIER_MEAL_LIMIT = 12;
  const feedbackTimeout = useRef(null);

  useEffect(
    () => () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
    },
    []
  );

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));


  useEffect(() => {
    let active = true;
    const loadMealCount = async () => {
      try {
        const meals = await getMeals();
        if (active) setMealCount(meals.length);
      } catch (err) {
        console.error(err);
      }
    };

    loadMealCount();
    return () => {
      active = false;
    };
  }, []);

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

    if (isRestrictedFreeUser(user) && mealCount >= FREE_TIER_MEAL_LIMIT) {
      setLimitReached(true);
      return;
    }

    setLimitReached(false);
    setShowPostCreatePrompt(false);
    setSaving(true);

    try {
      await API.post("/meals", {
        name: form.name.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        rating: form.rating,
      });

      setMealCount((prev) => prev + 1);
      setCreatedFeedback(true);
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      feedbackTimeout.current = setTimeout(() => setCreatedFeedback(false), 1500);
      setShowPostCreatePrompt(true);
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

  const onCreateAnother = () => {
    setForm({
      name: "",
      description: "",
      notes: "",
      rating: 0,
    });
    setCreatedFeedback(false);
    setShowPostCreatePrompt(false);
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
                title="You've reached the 12-meal limit"
                description="You've reached the 12-meal limit. Upgrade to Premium for unlimited meals + smart suggestions."
                upgradeHref="/app/upgrade"
                variant="modal"
              />
               <div className="flex gap-2">
              <Link
                to="/app/upgrade"
                className="inline-block rounded-lg bg-[rgb(127,155,130)] px-4 py-2 text-center text-white hover:bg-[rgb(112,140,115)]"
              >
                Upgrade to Premium
              </Link>
              <Link
                to="/app/dashboard"
                className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
              >
                 Delete a meal
              </Link>
              </div>
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
               <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <p className="mb-1 text-xs text-gray-500">
                Shows on your meal card - e.g., &quot;Ground beef tacos with all the toppings&quot;
              </p>
              <input
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                 placeholder='Ground beef tacos with all the toppings'
                value={form.description}
                onChange={onChange("description")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <p className="mb-1 text-xs text-gray-500">
                Private cooking notes - e.g., &quot;Use Old El Paso seasoning, kids like mild&quot;
              </p>
              <textarea
                className="w-full border rounded-lg p-2 min-h-22.5 focus:ring-2 focus:ring-blue-400"
                placeholder='Use Old El Paso seasoning, kids like mild'
                value={form.notes}
                onChange={onChange("notes")}
              />
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Rating (helps generate smart suggestions)</label>
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

             {showPostCreatePrompt && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-medium text-green-900">
                  Meal created! What would you like to do next?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={onCreateAnother}
                    className="flex-1 rounded-lg border border-green-700 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
                  >
                    Create another meal
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/app/dashboard")}
                    className="flex-1 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
                  >
                    Return to dashboard
                  </button>
                </div>
              </div>
            )}
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
