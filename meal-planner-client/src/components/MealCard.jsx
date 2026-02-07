import { Link } from "./Link";
import StarRating from "./StarRating";

function timeAgo(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
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

function formatDate(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MealCard({ meal, onServe, serving, serveLabel }) {
  const lastServedDate = formatDate(meal.lastServed);
  const lastServedAgo = timeAgo(meal.lastServed);

  const ratingValue =
    typeof meal.rating === "number" ? Math.max(0, Math.min(5, meal.rating)) : 0;

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
      {/* Clickable area -> Meal Detail */}
      <Link to={`/app/meals/${meal._id}`} className="block">
        {meal.imageUrl && (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-36 object-cover rounded-lg border"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate">{meal.name}</h3>

            {meal.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {meal.description}
              </p>
            )}
          </div>

          {/* Read-only stars */}
          <div className="shrink-0">
            <div className="bg-gray-100 px-2 py-1 rounded-lg">
              <StarRating value={ratingValue} readOnly size="sm" />
            </div>
          </div>
        </div>
      </Link>

      {/* Stats row */}
      <div className="text-sm text-gray-700 flex justify-between">
        <span>
          Served: <b>{meal.timesServed ?? 0}</b>
        </span>

        <span className="text-right">
          Last: <b>{lastServedDate}</b>
          <div className="text-xs text-gray-500">{lastServedAgo}</div>
        </span>
      </div>

      {/* Serve button */}
      <button
        onClick={() => onServe(meal._id)}
        disabled={serving}
        className="w-full bg-[rgb(127,155,130)] text-white rounded-lg py-2 hover:bg-[rgb(112,140,115)] disabled:opacity-60"
        type="button"
      >
       {serveLabel ?? (serving ? "Serving..." : "Serve Tonight")} 
      </button>
    </div>
  );
}
