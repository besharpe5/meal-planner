export default function StarRating({
  value = 0,
  onChange,
  size = "md", // "sm" | "md" | "lg"
  readOnly = false,
}) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses =
    size === "sm"
      ? "text-lg"
      : size === "lg"
      ? "text-3xl"
      : "text-2xl";

  const handleSet = (n) => {
    if (readOnly) return;
    onChange?.(n);
  };

  const handleKeyDown = (e) => {
    if (readOnly) return;
    if (!onChange) return;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, (value || 0) - 1));
    }
    if (e.key === "Home") {
      e.preventDefault();
      onChange(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      onChange(5);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Star rating"
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {stars.map((n) => {
        const filled = n <= (value || 0);

        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={filled}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            disabled={readOnly}
            onClick={() => handleSet(n)}
            className={`leading-none ${sizeClasses} ${
              readOnly ? "cursor-default" : "cursor-pointer"
            } ${filled ? "text-yellow-500" : "text-gray-300"} hover:opacity-90`}
          >
            ★
          </button>
        );
      })}

      {/* Optional numeric label */}
      <span className="ml-2 text-sm text-gray-600">
        {value ? `${value}/5` : "No rating"}
      </span>

      {!readOnly && value > 0 ? (
        <button
          type="button"
          onClick={() => handleSet(0)}
          className="ml-2 text-xs text-blue-700 hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
