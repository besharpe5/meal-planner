function timeAgo(dateString) {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  // If date is invalid
  if (Number.isNaN(date.getTime())) return "Unknown";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  return "just now";
}

function formatDate(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderStars(rating) {
  if (typeof rating !== "number") return null;
  const r = Math.max(0, Math.min(5, rating));
  const full = "★".repeat(Math.round(r));
  const empty = "☆".repeat(5 - Math.round(r));
  return `${full}${empty}`;
}

export default function MealCard({ meal, onServe, serving }) {
  const lastServedDate = formatDate(meal.lastServed);
  const lastServedAgo = timeAgo(meal.lastServed);

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
      {meal.imageUrl ? (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="w-full h-36 object-cover rounded-lg border"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{meal.name}</h3>
          {meal.description ? (
            <p className="text-sm text-gray-600">{meal.description}</p>
          ) : null}
        </div>

        {typeof meal.rating === "number" ? (
          <div className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-lg">
            <div className="leading-none">{renderStars(meal.rating)}</div>
            <div className="text-xs text-gray-600 text-right">{meal.rating.toFixed(1)}</div>
          </div>
        ) : null}
      </div>

      <div className="text-sm text-gray-700 flex justify-between">
        <span>
          Served: <b>{meal.timesServed ?? 0}</b>
        </span>
        <span className="text-right">
          Last: <b>{lastServedDate}</b>
          <div className="text-xs text-gray-500">{lastServedAgo}</div>
        </span>
      </div>

      <button
        onClick={() => onServe(meal._id)}
        disabled={serving}
        className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 disabled:opacity-60"
      >
        {serving ? "Serving..." : "Serve Tonight"}
      </button>
    </div>
  );
}
