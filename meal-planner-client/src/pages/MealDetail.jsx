// src/pages/MealDetail.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMealById, serveMeal } from "../services/mealService";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";

function timeAgo(dateString) {
  if (!dateString) return "Never";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 365) return `${Math.floor(days / 365)}y ago`;
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (minutes >= 1) return `${minutes}m ago`;
  return "just now";
}

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMealById(id);
      setMeal(data);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Load failed",
        message: "Could not load this meal.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleServe = async () => {
    if (!meal?._id) return;

    setServing(true);

    // optimistic update
    const prev = meal;
    setMeal((m) => ({
      ...m,
      timesServed: (m?.timesServed ?? 0) + 1,
      lastServed: new Date().toISOString(),
    }));

    try {
      const updated = await serveMeal(meal._id);
      setMeal(updated);

      addToast({
        type: "success",
        title: "Served tonight",
        message: "Updated times served and last served date.",
      });
    } catch (err) {
      console.error(err);
      setMeal(prev);

      addToast({
        type: "error",
        title: "Serve failed",
        message: "Could not update this meal. Please try again.",
      });
    } finally {
      setServing(false);
    }
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/meals/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: meal?.name || "Meal",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        addToast({
          type: "success",
          title: "Link copied",
          message: "Meal link copied to clipboard.",
        });
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Share failed",
        message: "Could not share/copy link.",
      });
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

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Meal not found.</p>
            <button
              className="mt-3 text-blue-700 hover:underline"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lastDate = meal.lastServed
    ? new Date(meal.lastServed).toLocaleString()
    : "Never";
  const lastAgo = timeAgo(meal.lastServed);

  const ratingValue =
    typeof meal.rating === "number" ? Math.max(0, Math.min(5, meal.rating)) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Link className="text-blue-700 hover:underline" to="/dashboard">
            ← Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={shareLink}
              className="text-sm border rounded-lg px-3 py-2 hover:bg-white"
            >
              Share
            </button>

            <Link
              to={`/meals/${meal._id}/edit`}
              className="text-sm bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-56 object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}

          <div className="p-6">
            <h1 className="text-2xl font-bold">{meal.name}</h1>
            {meal.description ? (
              <p className="text-gray-700 mt-1">{meal.description}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 border">
                <div className="text-xs text-gray-500">Rating</div>
                <div className="mt-1">
                  <StarRating value={ratingValue} readOnly size="md" />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 border">
                <div className="text-xs text-gray-500">Served</div>
                <div className="font-semibold">{meal.timesServed ?? 0} times</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 border col-span-2">
                <div className="text-xs text-gray-500">Last served</div>
                <div className="font-semibold">{lastDate}</div>
                <div className="text-xs text-gray-500 mt-1">{lastAgo}</div>
              </div>
            </div>

            {meal.notes ? (
              <div className="mt-4">
                <div className="text-sm font-semibold mb-1">Notes</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg border bg-gray-50 p-3">
                  {meal.notes}
                </div>
              </div>
            ) : null}

            <button
              onClick={handleServe}
              disabled={serving}
              className="mt-6 w-full bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 disabled:opacity-60"
              type="button"
            >
              {serving ? "Serving..." : "Serve Tonight"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={load}
            className="text-sm text-blue-700 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
