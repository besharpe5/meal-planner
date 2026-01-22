// src/pages/CreateMeal.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

export default function CreateMeal() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    notes: "",
    imageUrl: "",
    rating: 0,
  });

  const [saving, setSaving] = useState(false);

  const onChange = (key) => (e) => {
    const value = key === "rating" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      addToast({
        type: "error",
        title: "Missing name",
        message: "Please enter a meal name.",
        duration: 3500,
      });
      return;
    }

    setSaving(true);

    try {
      // Optional: quick “working” toast (short)
      addToast({
        type: "info",
        title: "Creating meal…",
        message: "Saving to your family library.",
        duration: 1200,
      });

      await API.post("/meals", {
        name: form.name.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        imageUrl: form.imageUrl.trim(),
        rating: form.rating,
      });

      addToast({
        type: "success",
        title: "Meal created",
        message: `"${form.name.trim()}" was added.`,
        duration: 3000,
      });

      // Small delay so the toast is visible before route change
      setTimeout(() => navigate("/dashboard"), 200);
    } catch (err) {
      console.error(err);

      addToast({
        type: "error",
        title: "Create failed",
        message: err?.response?.data?.message || "Failed to create meal.",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Meal</h1>
          <Link className="text-blue-700 hover:underline" to="/dashboard">
            Back
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 text-sm mb-4">
            Add a meal your family eats. You can edit it later.
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Meal name *
              </label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., Taco Night"
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
                placeholder="Quick summary (optional)"
                value={form.description}
                onChange={onChange("description")}
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
                We’ll replace this with a 5-star picker next.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
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
                className="w-1/2 border rounded-lg py-2 hover:bg-gray-50 disabled:opacity-60"
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
          Later: we’ll support photo uploads (not just URLs).
        </p>
      </div>
    </div>
  );
}
