// src/components/StarRating.jsx
import { useMemo, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function roundToStep(n, step) {
  return Math.round(n / step) * step;
}

function formatValue(v) {
  // show 3.5 instead of 3.0
  return Number.isInteger(v) ? `${v}` : v.toFixed(1);
}

function Star({ percentFilled, sizeClasses }) {
  // Two-layer star: gray base + gold overlay clipped by width %
  return (
    <span className={`relative inline-block leading-none ${sizeClasses}`}>
      <span className="text-gray-300">★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden text-yellow-500"
        style={{ width: `${percentFilled}%` }}
        aria-hidden="true"
      >
        ★
      </span>
    </span>
  );
}

/**
 * Props:
 * - value: number (0..5) supports halves
 * - onChange: (number) => void
 * - size: "sm" | "md" | "lg"
 * - readOnly: boolean
 * - step: number (default 0.5)
 */
export default function StarRating({
  value = 0,
  onChange,
  size = "md",
  readOnly = false,
  step = 0.5,
}) {
  const [hoverValue, setHoverValue] = useState(null);

  const sizeClasses =
    size === "sm"
      ? "text-lg"
      : size === "lg"
      ? "text-3xl"
      : "text-2xl";

  const safeValue = useMemo(() => clamp(value || 0, 0, 5), [value]);
  const displayValue = hoverValue !== null ? hoverValue : safeValue;

  const stars = [1, 2, 3, 4, 5];

  const getPercentFilled = (starNumber) => {
    // displayValue can be 2.5 etc.
    const diff = displayValue - (starNumber - 1);
    const clamped = clamp(diff, 0, 1);
    return clamped * 100; // 0, 50, 100, etc.
  };

  const computeValueFromPointer = (e, starNumber) => {
    // Determine if pointer is in left or right half of the star
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    const raw = isLeftHalf ? starNumber - 0.5 : starNumber;
    return roundToStep(clamp(raw, 0, 5), step);
  };

  const commitValue = (n) => {
    if (readOnly) return;
    if (!onChange) return;
    onChange(clamp(roundToStep(n, step), 0, 5));
  };

  const handleKeyDown = (e) => {
    if (readOnly || !onChange) return;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      commitValue((safeValue || 0) + step);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      commitValue((safeValue || 0) - step);
    }
    if (e.key === "Home") {
      e.preventDefault();
      commitValue(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      commitValue(5);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setHoverValue(null);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Star rating"
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => {
        // clear hover when leaving whole control
        if (!readOnly) setHoverValue(null);
      }}
    >
      {stars.map((starNumber) => {
        const percentFilled = getPercentFilled(starNumber);

        return (
          <button
            key={starNumber}
            type="button"
            disabled={readOnly}
            className={`${readOnly ? "cursor-default" : "cursor-pointer"} p-0`}
            aria-label={`${starNumber} stars`}
            onPointerMove={(e) => {
              if (readOnly) return;
              // show hover preview
              const hv = computeValueFromPointer(e, starNumber);
              setHoverValue(hv);
            }}
            onPointerLeave={() => {
              if (readOnly) return;
              setHoverValue(null);
            }}
            onPointerDown={(e) => {
              if (readOnly) return;
              const v = computeValueFromPointer(e, starNumber);
              commitValue(v);
            }}
            onClick={(e) => {
              // Fallback for environments where pointer events behave oddly
              if (readOnly) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isLeftHalf = x < rect.width / 2;
              const v = isLeftHalf ? starNumber - 0.5 : starNumber;
              commitValue(v);
            }}
          >
            <Star percentFilled={percentFilled} sizeClasses={sizeClasses} />
          </button>
        );
      })}

      {/* Label + Clear only when editable (still hidden for readOnly) */}
      {!readOnly && (
        <>
          <span className="ml-2 text-sm text-gray-600">
            {safeValue ? `${formatValue(safeValue)}/5` : "No rating"}
          </span>

          {safeValue > 0 && (
            <button
              type="button"
              onClick={() => commitValue(0)}
              className="ml-2 text-xs text-blue-700 hover:underline"
            >
              Clear
            </button>
          )}
        </>
      )}
    </div>
  );
}
