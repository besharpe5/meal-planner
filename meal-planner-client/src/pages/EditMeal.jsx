import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getMealById, updateMeal, deleteMeal } from "../services/mealService";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import { useDocumentTitle } from "../hooks/useDocumentTitle";


export default function EditMeal() {
  useDocumentTitle("MealPlanned | Edit Meal");
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
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
  }, [id, navigate, addToast]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateMeal(id, {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        imageUrl: form.imageUrl.trim(),
      });

      addToast({
        type: "success",
        title: "Meal updated",
        message: "Your changes were saved.",
      });

      setTimeout(() => navigate(`/meals/${id}`), 200);
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

  const onDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      addToast({
        type: "info",
        title: "Confirm delete",
        message: "Tap delete again to permanently remove this meal.",
      });
      return;
    }

    setDeleting(true);

    try {
      await deleteMeal(id);
      addToast({ type: "success", title: "Meal deleted" });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Delete failed",
        message: "Could not delete meal.",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Meal</h1>
          <Link to={`/meals/${id}`} className="text-blue-700 hover:underline">
            Back
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Meal name *</label>
              <input
                className="w-full border rounded-lg p-2"
                value={form.name}
                onChange={onChange("name")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                className="w-full border rounded-lg p-2"
                value={form.description}
                onChange={onChange("description")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded-lg p-2 min-h-[90px]"
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

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                className="w-full border rounded-lg p-2"
                value={form.imageUrl}
                onChange={onChange("imageUrl")}
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-40 object-cover rounded-lg border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="w-1/2 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={onDelete}
                className={`w-1/2 rounded-lg py-2 ${
                  confirmDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border text-red-700 hover:bg-red-50"
                }`}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : confirmDelete
                  ? "Confirm Delete"
                  : "Delete"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
