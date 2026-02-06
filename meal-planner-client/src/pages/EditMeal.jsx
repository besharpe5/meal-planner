import { useEffect, useRef, useState } from "react";
import { Link } from "../components/Link";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import {
  getMealById,
  updateMeal,
  deleteMeal,
  restoreMeal,
} from "../services/mealService";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function EditMeal({ mealId }) {
  useDocumentTitle("mealplanned · edit meal");
  const pageContext = usePageContext();
  const id = mealId ?? pageContext.routeParams?.id;
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    notes: "",
    imageUrl: "",
    rating: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // inline micro-feedback (preferred over a "Saved" toast)
  const [updatedFeedback, setUpdatedFeedback] = useState(false);
  const feedbackTimeout = useRef(null);
  const navigateTimeout = useRef(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const meal = await getMealById(id);
        setForm({
          name: meal.name || "",
          description: meal.description || "",
          notes: meal.notes || "",
          imageUrl: meal.imageUrl || "",
          rating: meal.rating ?? 0,
        });
      } catch (err) {
        console.error(err);
        addToast({
          type: "error",
          title: "Load failed",
          message: "Could not load this meal.",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, addToast, navigate]);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      if (navigateTimeout.current) clearTimeout(navigateTimeout.current);
    };
  }, []);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);

    try {
      await updateMeal(id, {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        imageUrl: form.imageUrl.trim(),
      });

      setUpdatedFeedback(true);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      if (navigateTimeout.current) clearTimeout(navigateTimeout.current);

      feedbackTimeout.current = setTimeout(() => setUpdatedFeedback(false), 1200);
      navigateTimeout.current = setTimeout(() => navigate(`/meals/${id}`), 1200);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Save failed",
        message: err?.response?.data?.message || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    addToast({
      type: "error",
      title: "Delete meal?",
      message: "This removes it from your list.",
      duration: 6000,
      action: {
        label: "Delete",
        onClick: async () => {
          setDeleting(true);
          try {
            await deleteMeal(id);

            // Calm, useful toast with Undo (destructive action rule ✅)
            addToast({
              type: "info",
              title: "Meal removed",
              message: "Undo if that was a mistake.",
              duration: 7000,
              action: {
                label: "Undo",
                onClick: async () => {
                  await restoreMeal(id);
                  // no need for an extra toast here; just take them back
                  navigate(`/meals/${id}`);
                },
              },
            });

            navigate("/dashboard");
          } catch (err) {
            console.error(err);
            addToast({
              type: "error",
              title: "Delete failed",
              message: err?.response?.data?.message || "Could not delete meal.",
            });
          } finally {
            setDeleting(false);
          }
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="mx-auto max-w-md text-sm text-slate-600">Loading…</div>
      </div>
    );
  }

  const sage = "focus:border-[rgb(127,155,130)] focus:ring-4 focus:ring-[rgba(127,155,130,0.28)]";

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">
            Edit meal
          </h1>
          <Link
            to={`/meals/${id}`}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-4"
          >
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Meal name *
              </label>
              <input
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ${sage}`}
                value={form.name}
                onChange={onChange("name")}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Description
              </label>
              <input
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ${sage}`}
                value={form.description}
                onChange={onChange("description")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Notes
              </label>
              <textarea
                className={`w-full min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ${sage}`}
                value={form.notes}
                onChange={onChange("notes")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Rating
              </label>
              <div className="rounded-xl border border-slate-200 p-2">
                <StarRating
                  value={form.rating}
                  onChange={(n) => setForm((prev) => ({ ...prev, rating: n }))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Image URL
              </label>
              <input
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ${sage}`}
                value={form.imageUrl}
                onChange={onChange("imageUrl")}
              />

              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-3 h-40 w-full rounded-xl border border-slate-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <div className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving || deleting}
                >
                  {saving ? "Saving…" : "Save"}
                </button>

                {updatedFeedback ? (
                  <div className="mt-2 text-xs font-medium text-[rgb(127,155,130)]">
                    Updated ✓
                  </div>
                ) : (
                  <div className="mt-2 h-4" />
                )}
              </div>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleting || saving}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
