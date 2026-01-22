// src/pages/EditMeal.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getMealById, updateMeal, deleteMeal } from "../services/mealService";
import { useToast } from "../context/ToastContext";

export default function EditMeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    notes: "",
    imageUrl: "",
    rating: 0,
  });

  useEffect(() => {
    const loadMeal = async () => {
      setError("");
      setLoading(true);
      try {
        const meal = await getMealById(id);
        setForm({
          name: meal.name || "",
          description: meal.description || "",
          notes: meal.notes || "",
          imageUrl: meal.imageUrl || "",
          rating: typeof meal.rating === "number" ? meal.rating : 0,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load meal");
        addToast({
          type: "error",
          title: "Load failed",
          message: "Could not load this meal. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMeal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (key) => (e) => {
    const value = key === "rating" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));

    // If user edits anything, cancel pending delete confirmation
    if (confirmDelete) setConfirmDelete(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await updateMeal(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        imageUrl: form.imageUrl.trim(),
        rating: form.rating,
      });

      addToast({
        type: "success",
        title: "Meal updated",
        message: "Your changes have been saved.",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to update meal";
      setError(msg);

      addToast({
        type: "error",
        title: "Save failed",
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  // First click: arm the delete (no browser confirm)
  const onDeleteArm = () => {
    setConfirmDelete(true);
    addToast({
      type: "info",
      title: "Confirm delete",
      message: "Click Delete again to permanently remove this meal.",
      duration: 4000,
    });
  };

  // Second click: actually delete
  const onDeleteConfirm = async () => {
    setError("");
    setDeleting(true);

    try {
      await deleteMeal(id);

      addToast({
        type: "success",
        title: "Meal deleted",
        message: "The meal has been removed.",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to delete meal";
      setError(msg);

      addToast({
        type: "error",
        title: "Delete failed",
        message: msg,
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Meal</h1>
          <Link className="text-blue-700 hover:underline" to="/dashboard">
            Back
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Meal name *
              </label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.name}
                onChange={onChange("name")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.description}
                onChange={onChange("description")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded-lg p-2 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.notes}
                onChange={onChange("notes")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Rating (0–5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.rating}
                onChange={onChange("rating")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.imageUrl}
                onChange={onChange("imageUrl")}
              />

              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-3 w-full h-48 object-cover rounded-lg border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="sm:flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={confirmDelete ? onDeleteConfirm : onDeleteArm}
                disabled={deleting}
                className={`sm:w-44 border rounded-lg py-2 disabled:opacity-60 ${
                  confirmDelete
                    ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                    : "border-red-300 text-red-700 hover:bg-red-50"
                }`}
              >
                {deleting
                  ? "Deleting..."
                  : confirmDelete
                  ? "Confirm Delete"
                  : "Delete"}
              </button>
            </div>

            {confirmDelete && (
              <p className="text-xs text-gray-500 pt-1">
                Click <b>Confirm Delete</b> again to permanently remove this meal.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
