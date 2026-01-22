import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getMealById, updateMeal, deleteMeal } from "../services/mealService";

export default function EditMeal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      } finally {
        setLoading(false);
      }
    };

    loadMeal();
  }, [id]);

  const onChange = (key) => (e) => {
    const value = key === "rating" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
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

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update meal");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const ok = window.confirm("Delete this meal? This cannot be undone.");
    if (!ok) return;

    setError("");
    setDeleting(true);

    try {
      await deleteMeal(id);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete meal");
    } finally {
      setDeleting(false);
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
              <label className="block text-sm font-medium mb-1">Meal name *</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.name}
                onChange={onChange("name")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
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
              <label className="block text-sm font-medium mb-1">Rating (0–5)</label>
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
                onClick={onDelete}
                disabled={deleting}
                className="sm:w-40 border border-red-300 text-red-700 rounded-lg py-2 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
