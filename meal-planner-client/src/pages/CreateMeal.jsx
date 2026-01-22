import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api"; // your axios instance w/ baseURL + JWT interceptor

export default function CreateMeal() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    notes: "",
    rating: 0,
    imageUrl: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (key) => (e) => {
    const value = key === "rating" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Adjust keys here to match your Meal model if needed
      await API.post("/meals", {
        name: form.name.trim(),
        notes: form.notes.trim(),
        rating: form.rating,
        imageUrl: form.imageUrl.trim(), // store URL (later can replace w/ upload)
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to create meal. Check server logs."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-1">Create Meal</h1>
          <p className="text-gray-600 text-sm mb-4">
            Add a meal your family eats. You can edit later.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Meal name</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., Taco Night"
                value={form.name}
                onChange={onChange("name")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded-lg p-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Optional notes (ingredients, tweaks, kid-approved, etc.)"
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
              <p className="text-xs text-gray-500 mt-1">
                We’ll replace this with a 5-star UI next.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL (optional)
              </label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={onChange("imageUrl")}
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-1/2 border rounded-lg py-2 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-1/2 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Tip: later we’ll support uploading photos instead of URLs.
        </p>
      </div>
    </div>
  );
}
