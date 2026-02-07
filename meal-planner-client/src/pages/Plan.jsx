import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "../components/Link";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { useToast } from "../context/ToastContext";
import { getMeals } from "../services/mealService";
import {
  getPlan,
  setPlanDayMeal,
  setPlanDayLeftovers,
  suggestPlanDay,
  fillPlanWeek,
  clearPlanDay,
  clearPlanWeek,
  servePlanDay,
} from "../services/planService";
import StarRating from "../components/StarRating";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  addDays,
  getWeekStartLocal,
  isSameDayUTCUTC,
  parseISODateLocal,
  toISODate,
  toLocalISODate,
} from "../utils/date";

/** --------- Date helpers ---------
 * Key rule:
 * - Server stores plan day dates at UTC midnight.
 * - When converting those Date objects to YYYY-MM-DD, use UTC getters.
 * - When displaying a YYYY-MM-DD, parse to a LOCAL Date for correct weekday/month/day.
 */
function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function daysSince(dateValue) {
  if (!dateValue) return Infinity;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return Infinity;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function formatLastServed(days) {
  if (!Number.isFinite(days)) return "Last served: Never";
  if (days < 7) return `Last served ${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `Last served ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (days < 365) return `Last served ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `Last served ${years} year${years === 1 ? "" : "s"} ago`;
}

/** --------- Small UI helpers --------- */
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WhyTooltip({ text }) {
  if (!text) return null;
  return (
    <span className="relative inline-flex items-center group">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
        i
      </span>
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition absolute left-1/2 -translate-x-1/2 top-7 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50">
        {text}
      </span>
    </span>
  );
}

export default function Plan() {
  useDocumentTitle("mealplanned · weekly plan");
  const { addToast } = useToast();
  const pageContext = usePageContext();
  const searchParams = useMemo(
    () => new URLSearchParams(pageContext.urlParsed?.searchOriginal || ""),
    [pageContext.urlParsed?.searchOriginal]
  );

  const [meals, setMeals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // per-row spinners
  const [savingDay, setSavingDay] = useState(null);
  const [servingDay, setServingDay] = useState(null);
  const [suggestingDay, setSuggestingDay] = useState(null);
  const [fillingWeek, setFillingWeek] = useState(false);
  const [serveFeedbackByDay, setServeFeedbackByDay] = useState({});
  const serveFeedbackTimersRef = useRef({});

  const [savedDay, setSavedDay] = useState(null);
  const [savedLabel, setSavedLabel] = useState("");
  const [weekFeedback, setWeekFeedback] = useState("");


  // Store last suggestion "why" per dayIndex so tooltip persists
  const [whyByDay, setWhyByDay] = useState({}); // { [idx]: string }

  // Suggestion filters
  const [minRating, setMinRating] = useState(0);
  const [excludeServedWithinDays, setExcludeServedWithinDays] = useState(0);
  const [excludePlanned, setExcludePlanned] = useState(true);

  // Clear week confirmation
  const [clearArmed, setClearArmed] = useState(false);
  const clearTimerRef = useRef(null);

  const savedTimerRef = useRef(null);
  const weekFeedbackTimerRef = useRef(null);

  // Week state (URL-driven)
  const [weekStart, setWeekStart] = useState(() => {
    const weekParam = searchParams.get("week");
    if (!weekParam) return getWeekStartLocal(new Date());

    const d = parseISODateLocal(weekParam);
    if (Number.isNaN(d.getTime())) return getWeekStartLocal(new Date());

    return getWeekStartLocal(d);
  });

  // ✅ weekStartISO is YYYY-MM-DD based on LOCAL weekStart date (safe; weekStart is local midnight)
  // Using toISODate(weekStart) is fine because weekStart is derived locally and not coming from server.
  // But since toISODate uses UTC getters, keep weekStart constructed at local midnight; it will still yield same calendar date.
  const weekStartISO = useMemo(() => toLocalISODate(weekStart), [weekStart]);

  const todayISO = useMemo(() => {
    const today = new Date();
    return toLocalISODate(today);
  }, []);

  const hasFillableDays = useMemo(() => {
    return (plan?.days || []).some(
      (d) => (d?.entryType || "none") === "none"
    );
  }, [plan]);
  

  // Keep URL normalized to Monday weekStart
  useEffect(() => {
    const urlWeek = searchParams.get("week");
    const normalized = weekStartISO;

    if (!urlWeek) {
      navigate(`/plan?week=${normalized}`, { overwriteLastHistoryEntry: true });
      return;
    }
    if (urlWeek !== normalized) {
      navigate(`/plan?week=${normalized}`, { overwriteLastHistoryEntry: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO]);

  const optionsPayload = useMemo(
    () => ({
      minRating: Number(minRating) || 0,
      excludeServedWithinDays: Number(excludeServedWithinDays) || 0,
      excludePlanned: !!excludePlanned,
    }),
    [minRating, excludeServedWithinDays, excludePlanned]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [mealsData, planData] = await Promise.all([getMeals(), getPlan(weekStartISO)]);
      setMeals(mealsData);
      setPlan(planData);
      setWhyByDay({});
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Planner failed to load",
        message: err?.message || "Could not load meals and plan.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO]);

  // Reload when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      Object.values(serveFeedbackTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const dayDateISO = (dayIndex) => {
    if (!plan?.days?.[dayIndex]) return "";
    // ✅ plan.days[].date comes from server (UTC midnight), so use UTC-safe toISODate
    return toISODate(plan.days[dayIndex].date);
  };

  const applyPlanSnapshotDay = async (planId, snapshotDay) => {
    if (!planId || !snapshotDay) return null;

    const entryType = snapshotDay?.entryType || "none";
    const dayDate = toISODate(snapshotDay.date);

    if (entryType === "meal") {
      const mealId =
        snapshotDay?.meal && typeof snapshotDay.meal === "object" ? snapshotDay.meal._id : snapshotDay?.meal;
      if (!mealId) return null;
      return await setPlanDayMeal(planId, {
        dayDate,
        mealId,
      });
    }

    if (entryType === "leftovers") {
      const leftoversISO = snapshotDay?.leftoversFrom ? toISODate(snapshotDay.leftoversFrom) : null;
      if (!leftoversISO) return null;
      return await setPlanDayLeftovers(planId, {
        dayDate,
        leftoversFrom: leftoversISO,
        countAsServed: !!snapshotDay?.countAsServed,
      });
    }

    return await clearPlanDay(planId, { dayDate });
  };

  const restorePlanSnapshot = async (snapshotPlan) => {
    if (!snapshotPlan?._id || !snapshotPlan?.days?.length) return null;
    let latestPlan = snapshotPlan;

    for (const day of snapshotPlan.days) {
      const updated = await applyPlanSnapshotDay(snapshotPlan._id, day);
      if (updated) latestPlan = updated;
    }

    return latestPlan;
  };

  const showSavedForDay = (dayIndex, label = "Saved") => {
    setSavedDay(dayIndex);
    setSavedLabel(label);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
      setSavedDay((current) => (current === dayIndex ? null : current));
      setSavedLabel("");
    }, 1600);
  };

  const showWeekFeedback = (label) => {
    setWeekFeedback(label);
    if (weekFeedbackTimerRef.current) clearTimeout(weekFeedbackTimerRef.current);
    weekFeedbackTimerRef.current = setTimeout(() => {
      setWeekFeedback("");
    }, 1600);
  };

  /** --------- Resolve “planned meal” (meal OR leftovers via DATE) --------- */
  const findDayIndexByISO = (iso) => {
    if (!plan?.days?.length || !iso) return -1;
    return plan.days.findIndex((d) => toISODate(d.date) === iso);
  };

  const resolvePlannedMealForDay = (day) => {
    const entryType = day?.entryType || "none";

    if (entryType === "leftovers" && day?.leftoversFrom) {
      const leftoversISO = toISODate(day.leftoversFrom);
      const srcIdx = findDayIndexByISO(leftoversISO);
      const srcDay = srcIdx >= 0 ? plan.days[srcIdx] : null;

      const srcMealId = srcDay?.meal && typeof srcDay.meal === "object" ? srcDay.meal._id : srcDay?.meal;
      const mealObj =
        meals.find((m) => m._id === srcMealId) || (typeof srcDay?.meal === "object" ? srcDay.meal : null);

      return {
        kind: "leftovers",
        leftoversFromISO: leftoversISO,
        sourceIndex: srcIdx,
        meal: mealObj,
        countAsServed: !!day?.countAsServed,
        servedAt: day?.servedAt || null,
      };
    }

    if (entryType === "meal" && day?.meal) {
      const mealId = typeof day.meal === "object" ? day.meal._id : day.meal;
      const mealObj = meals.find((m) => m._id === mealId) || (typeof day.meal === "object" ? day.meal : null);

      return {
        kind: "meal",
        leftoversFromISO: "",
        sourceIndex: -1,
        meal: mealObj,
        countAsServed: false,
        servedAt: day?.servedAt || null,
      };
    }

    return {
      kind: "none",
      leftoversFromISO: "",
      sourceIndex: -1,
      meal: null,
      countAsServed: false,
      servedAt: day?.servedAt || null,
    };
  };

  const leftoversOptionsForIndex = (idx) => {
    if (!plan?.days?.length) return [];

    const options = [];
    for (let i = 0; i < idx; i++) {
      const d = plan.days[i];
      if ((d?.entryType || "none") !== "meal") continue;

      const mealId = d?.meal && typeof d.meal === "object" ? d.meal._id : d?.meal;
      const mealObj = meals.find((m) => m._id === mealId) || (typeof d?.meal === "object" ? d.meal : null);
      const mealName = mealObj?.name;
      if (!mealName) continue;

      const labelDate = parseISODateLocal(toISODate(d.date)).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      options.push({
        iso: toISODate(d.date),
        label: `${labelDate} – ${mealName}`,
      });
    }
    return options;
  };

  /** --------- Mutations: pick/clear meal, set leftovers, serve --------- */
  const onPickMeal = async (dayIndex, mealId) => {
    if (!plan?._id || !plan?.days?.[dayIndex]) return;

    setSavingDay(dayIndex);

    const prev = plan;
    const prevWhy = { ...whyByDay };
    const chosenMeal = meals.find((m) => m._id === mealId) || null;

    // Optimistic update
    const next = {
      ...plan,
      days: plan.days.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              entryType: mealId ? "meal" : "none",
              meal: chosenMeal || null,
              leftoversFrom: null,
              countAsServed: false,
              servedAt: null,
            }
          : d
      ),
    };
    setPlan(next);

    try {
      const updatedPlan = await setPlanDayMeal(plan._id, {
        dayDate: dayDateISO(dayIndex),
        mealId: mealId || null,
      });

      setPlan(updatedPlan);
      showSavedForDay(dayIndex, "Saved");
    } catch (err) {
      console.error(err);
      setPlan(prev);
      addToast({
        type: "error",
        title: "Save failed",
        message: err?.message || "Could not update that day.",
      });
    } finally {
      setSavingDay(null);
    }
  };

  const setLeftoversForDay = async (dayIndex, leftoversFromISO, countAsServed) => {
    if (!plan?._id || !plan?.days?.[dayIndex]) return;

    setSavingDay(dayIndex);

    const prev = plan;

    const next = {
      ...plan,
      days: plan.days.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              entryType: leftoversFromISO ? "leftovers" : "none",
              meal: null,
              leftoversFrom: leftoversFromISO ? parseISODateLocal(leftoversFromISO) : null,
              countAsServed: leftoversFromISO ? !!countAsServed : false,
              servedAt: null,
            }
          : d
      ),
    };
    setPlan(next);

    try {
      const updatedPlan = await setPlanDayLeftovers(plan._id, {
        dayDate: dayDateISO(dayIndex),
        leftoversFrom: leftoversFromISO || null,
        countAsServed: !!countAsServed,
      });

      setPlan(updatedPlan);
      showSavedForDay(dayIndex, "Saved");
    } catch (err) {
      console.error(err);
      setPlan(prev);
      addToast({
        type: "error",
        title: "Leftovers failed",
        message: err?.message || "Could not set leftovers for that day.",
      });
    } finally {
      setSavingDay(null);
    }
  };

  const clearDay = async (dayIndex) => {
    if (!plan?._id || !plan?.days?.[dayIndex]) return;
  
    setSavingDay(dayIndex);
    const prev = plan;
  
    // optimistic UI
    const next = {
      ...plan,
      days: plan.days.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              entryType: "none",
              meal: null,
              leftoversFrom: null,
              countAsServed: false,
              servedAt: null,
            }
          : d
      ),
    };
    setPlan(next);
  
    setWhyByDay((p) => {
      const n = { ...p };
      delete n[dayIndex];
      return n;
    });
  
    try {
      const updatedPlan = await clearPlanDay(plan._id, {
        dayDate: dayDateISO(dayIndex),
      });
  
      setPlan(updatedPlan);
  
      addToast({
        type: "success",
        title: "Cleared",
        message: `${DAY_NAMES[dayIndex]} cleared.`,
        duration: 4500,
        action: {
          label: "Undo",
          onClick: async () => {
            setSavingDay(dayIndex);
            setPlan(prev);
            setWhyByDay(prevWhy);
            try {
              const restored = await applyPlanSnapshotDay(prev._id, prev.days[dayIndex]);
              if (restored) setPlan(restored);
              setWhyByDay(prevWhy);
              addToast({
                type: "success",
                title: "Restored",
                message: `${DAY_NAMES[dayIndex]} restored.`,
                duration: 1600,
              });
            } catch (err) {
              console.error(err);
              addToast({
                type: "error",
                title: "Undo failed",
                message: err?.message || "Could not restore that day.",
              });
            } finally {
              setSavingDay(null);
            }
          },
        },
      });
    } catch (err) {
      console.error(err);
      setPlan(prev);
      setWhyByDay(prevWhy);
      addToast({
        type: "error",
        title: "Clear failed",
        message: err?.message || "Could not clear that day.",
      });
    } finally {
      setSavingDay(null);
    }
  };
  

  const onServeFromPlan = async (dayIndex) => {
    if (!plan?._id || !plan?.days?.[dayIndex]) return;

    const day = plan.days[dayIndex];
    const dayDate = toISODate(day.date);
    const resolved = resolvePlannedMealForDay(day);
    const meal = resolved.meal;
    const mealId = meal?._id;

    if (!mealId) return;

    if (resolved.kind === "leftovers" && !resolved.countAsServed) {
      addToast({
        type: "info",
        title: "Not counting as served",
        message: 'Enable "Count as serve" if you want this leftovers day to increment servings.',
        duration: 2600,
      });
      return;
    }

    // Check if this day was already served (on the day's date, not necessarily today)
    if (resolved?.servedAt) {
      const servedDateStr = parseISODateLocal(toISODate(resolved.servedAt)).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      addToast({
        type: "info",
        title: "Already served",
        message: `This plan day was already marked as served on ${servedDateStr}.`,
        duration: 2200,
      });
      return;
    }

    // Check if the meal was served on this specific day already
    const mealServedOnThisDay = meal?.lastServed && isSameDayUTC(meal.lastServed, day.date);
    if (mealServedOnThisDay) {
      addToast({
        type: "info",
        title: "Already served",
        message: "This meal was already marked served on this date.",
        duration: 2200,
      });
      return;
    }

    setServingDay(dayIndex);

    try {
      const updatedPlan = await servePlanDay(plan._id, {
        dayDate: dayDateISO(dayIndex),
        served: true,
        servedDate: dayDate,
      });

      setPlan(updatedPlan);

      setServeFeedbackByDay((prev) => ({ ...prev, [dayIndex]: true }));
      if (serveFeedbackTimersRef.current[dayIndex]) {
        clearTimeout(serveFeedbackTimersRef.current[dayIndex]);
      }
      serveFeedbackTimersRef.current[dayIndex] = setTimeout(() => {
        setServeFeedbackByDay((prev) => ({ ...prev, [dayIndex]: false }));
      }, 2000);

      await load();
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Serve failed",
        message: err?.message || "Could not mark served.",
      });
    } finally {
      setServingDay(null);
    }
  };

  const suggestForDay = async (dayIndex) => {
    if (!plan?._id) return;

    setSuggestingDay(dayIndex);

    try {
      const res = await suggestPlanDay(plan._id, {
        dayDate: dayDateISO(dayIndex),
        ...optionsPayload,
      });

      // Your API returns { updatedPlan, suggestion }
      if (res?.updatedPlan) setPlan(res.updatedPlan);

      setWhyByDay((prev) => ({ ...prev, [dayIndex]: res?.suggestion?.reason || "" }));

      showSavedForDay(dayIndex, "Suggested");
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Suggest failed",
        message: err?.message || "Could not generate a suggestion.",
        duration: 2200,
      });
    } finally {
      setSuggestingDay(null);
    }
  };

  const fillWeekWithSuggestions = async () => {
    if (!plan?._id || fillingWeek) return;
  
    // If nothing to fill, give soft feedback (also covered by button disable)
    if (!hasFillableDays) {
      addToast({
        type: "info",
        title: "Nothing to fill",
        message: "All days already have entries. Clear a day (or the week) to fill again.",
        duration: 2200,
      });
      return;
    }
  
    setFillingWeek(true);
  
    try {
      const prevEmptyCount = (plan?.days || []).filter((d) => (d?.entryType || "none") === "none").length;
  
      // ✅ If your backend fill-week uses filters, pass them. If it doesn’t, it will ignore them safely.
      const res = await fillPlanWeek(plan._id, weekStartISO, optionsPayload);
  
      // Support either response style:
      const updatedPlan = res?.updatedPlan || res;
      const suggestions = Array.isArray(res?.suggestions) ? res.suggestions : [];
  
      setPlan(updatedPlan);
  
      // Store reasons if backend returned them
      if (suggestions.length) {
        setWhyByDay((prev) => {
          const next = { ...prev };
          suggestions.forEach((s) => {
            if (typeof s?.dayIndex === "number") next[s.dayIndex] = s.reason || "";
          });
          return next;
        });
      }
  
      const nextEmptyCount = (updatedPlan?.days || []).filter((d) => (d?.entryType || "none") === "none").length;
      const filledCount = Math.max(0, prevEmptyCount - nextEmptyCount);
  
      if (filledCount === 0) {
        addToast({
          type: "info",
          title: "No matches for your filters",
          message:
            "Try lowering the minimum rating, unchecking “Avoid duplicates,” or reducing the served window.",
          duration: 3000,
        });
        return;
      }
  
      showWeekFeedback(filledCount === 1 ? "Added 1 suggestion" : `Added ${filledCount} suggestions`);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Fill week failed",
        message: err?.message || "Could not fill the week with suggestions.",
        duration: 2400,
      });
    } finally {
      setFillingWeek(false);
    }
  };
  


  /** --------- Clear all week --------- */
  const armClearAll = () => {
    setClearArmed(true);

    addToast({
      type: "warning",
      title: "Confirm clear week",
      message: "Click “Clear week” again to remove all planned meals.",
      duration: 3500,
    });

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setClearArmed(false), 5000);
  };

  const clearAllWeek = async () => {
    if (!plan?._id) return;

    if (!clearArmed) {
      armClearAll();
      return;
    }

    setClearArmed(false);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    const prev = plan;
    const prevWhy = { ...whyByDay };

    try {
      const updatedPlan = await clearPlanWeek(plan._id, weekStartISO);
      setPlan(updatedPlan);
      setWhyByDay({});

      addToast({
        type: "success",
        title: "Week cleared",
        message: "All planned meals removed.",
        duration: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            setPlan(prev);
            setWhyByDay(prevWhy);
            try {
              const restored = await restorePlanSnapshot(prev);
              if (restored) setPlan(restored);
              setWhyByDay(prevWhy);
              addToast({
                type: "success",
                title: "Week restored",
                message: "Your previous plan is back.",
                duration: 2000,
              });
            } catch (err) {
              console.error(err);
              addToast({
                type: "error",
                title: "Undo failed",
                message: err?.message || "Could not restore the week.",
              });
            }
          },
        },
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Clear failed",
        message: err?.message || "Could not clear the week.",
      });
    }
  };

  /** --------- Week nav --------- */
  const goPrevWeek = () => {
    const next = addDays(weekStart, -7);
    setWeekStart(next);
    navigate(`/plan?week=${(() => {
      const d = new Date(next);
      d.setHours(0, 0, 0, 0);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    })()}`);
  };

  const goNextWeek = () => {
    const next = addDays(weekStart, 7);
    setWeekStart(next);
    navigate(`/plan?week=${(() => {
      const d = new Date(next);
      d.setHours(0, 0, 0, 0);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    })()}`);
  };

  const goThisWeek = () => {
    const monday = getWeekStartLocal(new Date());
    setWeekStart(monday);
    navigate(`/plan?week=${(() => {
      const d = new Date(monday);
      d.setHours(0, 0, 0, 0);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    })()}`);
  };

  /** --------- Render states --------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">Loading…</div>
        </div>
      </div>
    );
  }

  if (!meals.length) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-1">Weekly Plan</h1>
            <p className="text-sm text-gray-600 mb-4">{formatWeekRange(weekStart)}</p>
            <p className="text-gray-700 mb-4">Add meals first, then you can plan and get suggestions.</p>
            <Link
              to="/app/meals/new"
              className="inline-block bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              + Add your first meal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeFiltersText = [
    minRating > 0 ? `≥ ⭐${Number(minRating).toFixed(1)}` : null,
    excludeServedWithinDays > 0 ? `exclude < ${excludeServedWithinDays} days` : null,
    excludePlanned ? "avoid duplicates" : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Weekly Plan</h1>
            <p className="text-sm text-gray-600">{formatWeekRange(weekStart)}</p>
            {activeFiltersText ? <p className="text-xs text-gray-500 mt-1">Suggestions: {activeFiltersText}</p> : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={goPrevWeek} className="border rounded-lg px-3 py-2 text-sm hover:bg-white" type="button">
              ← Prev
            </button>

            <button onClick={goThisWeek} className="border rounded-lg px-3 py-2 text-sm hover:bg-white" type="button">
              This Week
            </button>

            <button onClick={goNextWeek} className="border rounded-lg px-3 py-2 text-sm hover:bg-white" type="button">
              Next →
            </button>

            <button
  onClick={fillWeekWithSuggestions}
  className="border rounded-lg px-3 py-2 text-sm hover:bg-white disabled:opacity-60"
  type="button"
  disabled={fillingWeek || !hasFillableDays}
  title={
    !hasFillableDays
      ? "Week full — clear a day (or the week) to fill again."
      : "Fill empty days with suggestions"
  }
>
  {fillingWeek ? "Filling..." : !hasFillableDays ? "Week Full" : "Fill Week"}
</button>

{weekFeedback ? (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                ✓ {weekFeedback}
              </span>
            ) : null}



            <button
              onClick={clearAllWeek}
              className={`border rounded-lg px-3 py-2 text-sm disabled:opacity-60 ${
                clearArmed ? "border-red-400 bg-red-50 text-red-700" : "hover:bg-white"
              }`}
              type="button"
              disabled={!plan?._id}
              title={clearArmed ? "Click again to confirm" : "Clear all meals in this week"}
            >
              {clearArmed ? "Confirm clear" : "Clear Week"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min rating</label>
              <select
                className="w-full border rounded-lg p-2 bg-white"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value={0}>Any</option>
                <option value={3}>≥ 3.0</option>
                <option value={3.5}>≥ 3.5</option>
                <option value={4}>≥ 4.0</option>
                <option value={4.5}>≥ 4.5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Exclude served within (days)</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg p-2"
                value={excludeServedWithinDays}
                onChange={(e) => setExcludeServedWithinDays(Number(e.target.value))}
                placeholder="0 = no exclusion"
              />
              <p className="text-xs text-gray-500 mt-1">Example: 14 excludes meals served in last 2 weeks.</p>
            </div>

            <div className="flex items-start gap-2 sm:justify-end sm:pt-7">
              <input
                id="excludePlanned"
                type="checkbox"
                checked={excludePlanned}
                onChange={(e) => setExcludePlanned(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="excludePlanned" className="text-sm">
                Avoid duplicates in week
              </label>
            </div>
          </div>
        </div>

        {/* Days list */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="divide-y">
            {plan?.days?.map((day, idx) => {
              // ✅ dateISO is stable even if server stores UTC-midnight
              const dateISO = toISODate(day.date);
              const isToday = dateISO === todayISO;

              // ✅ Use ISO -> local Date for display
              const displayDate = parseISODateLocal(dateISO);

              const dateStr = displayDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              });

              const resolved = resolvePlannedMealForDay(day);
              const meal = resolved.meal;

              const ratingValue = typeof meal?.rating === "number" ? Math.max(0, Math.min(5, meal.rating)) : 0;

              const servedToday =
                (resolved.servedAt && isSameDayUTC(resolved.servedAt, new Date())) ||
                (meal?.lastServed && isSameDayUTC(meal.lastServed, new Date()));

              const servedDays = daysSince(meal?.lastServed);
              const servedText = formatLastServed(servedDays);
              const whyText =
                whyByDay[idx] ||
                (meal ? `${servedText} • ⭐ ${ratingValue.toFixed(1)}` : "");

              const selectedMealId = resolved.kind === "meal" ? meal?._id || "" : "";
              const selectedLeftoversISO = resolved.kind === "leftovers" ? resolved.leftoversFromISO : "";

              const leftoversOptions = leftoversOptionsForIndex(idx);
              const leftoversDisabled = leftoversOptions.length === 0;

              const busy = savingDay === idx || suggestingDay === idx || fillingWeek;

              return (
                <div key={idx} className={`p-4 ${isToday ? "bg-blue-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold">{dateStr}</div>
                        {isToday && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Today</span>
                        )}
                        {whyText ? <WhyTooltip text={whyText} /> : null}
                        {servedToday && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Served today</span>
                        )}
                        {savedDay === idx ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            ✓ {savedLabel || "Saved"}
                          </span>
                        ) : null}
                      </div>

                      {meal ? (
                        <div className="text-sm text-gray-700 mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-gray-500">{resolved.kind === "leftovers" ? "Leftovers:" : "Planned:"}</span>

                          <Link
                            to={`/meals/${meal._id}?from=plan&week=${weekStartISO}`}
                            className="text-blue-700 hover:underline font-medium"
                          >
                            {meal.name}
                          </Link>

                          <div className="bg-gray-100 px-2 py-1 rounded-lg">
                            <StarRating value={ratingValue} readOnly size="sm" />
                          </div>

                          {resolved.kind === "leftovers" && resolved.leftoversFromISO ? (
                            <span className="text-xs text-gray-500">
                              (from{" "}
                              {parseISODateLocal(resolved.leftoversFromISO).toLocaleDateString(undefined, {
                                weekday: "short",
                              })}
                              )
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 mt-1">No meal planned</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded-lg p-2 text-sm w-full bg-white"
                          value={selectedMealId}
                          disabled={busy || resolved.kind === "leftovers"}
                          onChange={(e) => {
                            setWhyByDay((prev) => {
                              const next = { ...prev };
                              delete next[idx];
                              return next;
                            });
                            onPickMeal(idx, e.target.value);
                          }}
                        >
                          <option value="">— Select a meal —</option>
                          {meals.map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name}
                            </option>
                          ))}
                        </select>

                        {resolved.kind === "leftovers" ? (
                          <span className="text-xs text-gray-500 whitespace-nowrap">(disabled)</span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded-lg p-2 text-sm w-full bg-white"
                          value={selectedLeftoversISO || ""}
                          disabled={busy || leftoversDisabled}
                          onChange={(e) => {
                            const iso = e.target.value;

                            setWhyByDay((prev) => {
                              const next = { ...prev };
                              delete next[idx];
                              return next;
                            });

                            if (iso === "") {
                              setLeftoversForDay(idx, null, false);
                            } else {
                              setLeftoversForDay(idx, iso, false);
                            }
                          }}
                        >
                          <option value="">{leftoversDisabled ? "No leftovers options" : "No leftovers"}</option>
                          {leftoversOptions.map((opt) => (
                            <option key={opt.iso} value={opt.iso}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <label className="flex items-center gap-2 text-xs text-gray-600 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            disabled={busy || resolved.kind !== "leftovers" || !resolved.leftoversFromISO}
                            checked={resolved.kind === "leftovers" ? !!resolved.countAsServed : false}
                            onChange={(e) => {
                              if (resolved.kind !== "leftovers") return;
                              setLeftoversForDay(idx, resolved.leftoversFromISO, e.target.checked);
                            }}
                          />
                          Count as serve
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-60"
                        disabled={
                          !meal ||
                          servingDay === idx ||
                          servedToday ||
                          (resolved.kind === "leftovers" && !resolved.countAsServed)
                        }
                        onClick={() => onServeFromPlan(idx)}
                        title={
                          resolved.kind === "leftovers" && !resolved.countAsServed
                            ? 'Enable "Count as serve" to mark served'
                            : isToday
                            ? "Mark as served today"
                            : `Mark as served on ${dateStr.split(',')[0]}`
                        }
                      >
                        {servingDay === idx
                          ? "Serving..."
                          : serveFeedbackByDay[idx]
                          ? "Served ✓"
                          : servedToday
                          ? "Served"
                          : isToday
                          ? "Serve"
                          : `Serve (${DAY_NAMES[idx]})`}
                      </button>

                      <button
                        type="button"
                        className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                        disabled={busy}
                        onClick={() => clearDay(idx)}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                        disabled={suggestingDay === idx || fillingWeek}
                        onClick={() => suggestForDay(idx)}
                        title="Pick a smart suggestion"
                      >
                        {suggestingDay === idx ? "Suggesting..." : "Suggest"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">Next upgrades: notes per day, bulk save, and drag-and-drop planning.</p>
      </div>
    </div>
  );
}
