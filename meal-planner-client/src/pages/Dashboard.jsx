import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "../components/Link";
import { UtensilsCrossed } from "lucide-react";
import MealCard from "../components/MealCard";
import UpgradePrompt from "../components/UpgradePrompt";
import { getMeals, serveMeal, getMealSuggestions } from "../services/mealService";
import { getPlan, servePlanDay, setPlanDayMeal } from "../services/planService";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getWeekStartLocal, isSameDayUTC, toISODate, toLocalISODate } from "../utils/date";
import { AuthContext } from "../context/authContext";
import { isRestrictedFreeUser } from "../utils/access";

export default function Dashboard() {
  useDocumentTitle("mealplanned");

  const { addToast } = useToast();
  const { user } = useContext(AuthContext);

  const FREE_TIER_MEAL_LIMIT = 12;
  const UPGRADE_WARNING_THRESHOLD = 10;

  const [meals, setMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [servingId, setServingId] = useState("");
  const [serveFeedbackId, setServeFeedbackId] = useState("");
  const [loading, setLoading] = useState(true);
  const [planPrompt, setPlanPrompt] = useState(null);
  const [todaysPlannedMealId, setTodaysPlannedMealId] = useState("");
  const [showSuggestedTonight, setShowSuggestedTonight] = useState(false);
  const isFreeTierLimitReached = isRestrictedFreeUser(user) && meals.length >= FREE_TIER_MEAL_LIMIT;
  const isApproachingMealLimit = isRestrictedFreeUser(user)
    && meals.length >= UPGRADE_WARNING_THRESHOLD
    && meals.length < FREE_TIER_MEAL_LIMIT;
  const [planPromptSaving, setPlanPromptSaving] = useState(false);
  const [showMealLimitModal, setShowMealLimitModal] = useState(false);
  const serveFeedbackTimerRef = useRef(null);
  const mealLibraryRef = useRef(null);

  useEffect(() => {
    return () => {
      if (serveFeedbackTimerRef.current) {
        clearTimeout(serveFeedbackTimerRef.current);
      }
    };
  }, []);

  const mealNameById = useMemo(() => {
    const map = new Map();
    meals.forEach((meal) => map.set(meal._id, meal.name));
    suggestions.forEach((meal) => map.set(meal._id, meal.name));
    return map;
  }, [meals, suggestions]);

  const todaysPlannedMeal = useMemo(() => {
    if (!todaysPlannedMealId) return null;
    return meals.find((meal) => meal._id === todaysPlannedMealId)
      || suggestions.find((meal) => meal._id === todaysPlannedMealId)
      || null;
  }, [meals, suggestions, todaysPlannedMealId]);

  const shouldShowTonightPlan = Boolean(todaysPlannedMeal) && !showSuggestedTonight;

  const loadData = async () => {
    setLoading(true);

    try {
        const today = new Date();
      const weekStart = getWeekStartLocal(today);
      const weekStartYMD = toLocalISODate(weekStart);
      const dayDate = toLocalISODate(today);

      const [mealsData, suggestionsData, planData] = await Promise.all([
        getMeals(),
        getMealSuggestions(5),
        getPlan(weekStartYMD),
      ]);

      setMeals(mealsData);
      setSuggestions(suggestionsData);
       const todaysPlan = (planData?.days || []).find((d) => toISODate(d.date) === dayDate);
      const plannedMealId = todaysPlan?.entryType === "meal"
        ? (typeof todaysPlan.meal === "object" ? todaysPlan.meal?._id : todaysPlan.meal)
        : "";

      setTodaysPlannedMealId(plannedMealId || "");
      if (!plannedMealId) {
        setShowSuggestedTonight(false);
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Load failed",
        message: "Could not fetch meals. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePlanForServe = async (mealId) => {
    const today = new Date();
    const weekStart = getWeekStartLocal(today);
    const weekStartYMD = toLocalISODate(weekStart);
    const dayDate = toLocalISODate(today);

    const plan = await getPlan(weekStartYMD);
    const day = (plan?.days || []).find((d) => toISODate(d.date) === dayDate);
    if (!day) return;

    const entryType = day.entryType || "none";
    const plannedMealId = typeof day.meal === "object" ? day.meal?._id : day.meal;
    const plannedMealName =
      entryType === "leftovers"
        ? "Leftovers"
        : mealNameById.get(plannedMealId) || "Planned meal";
    const servedMealName = mealNameById.get(mealId) || "Served meal";
    const servedAlready = day.servedAt && isSameDayUTC(day.servedAt, new Date());

    if (entryType === "none") {
      await setPlanDayMeal(plan._id, { dayDate, mealId });
      await servePlanDay(plan._id, { dayDate, served: true, servedDate: dayDate });
      return;
    }

    if (entryType === "meal" && plannedMealId && String(plannedMealId) === String(mealId)) {
      if (!servedAlready) {
        await servePlanDay(plan._id, { dayDate, served: true, servedDate: dayDate });
      }
      return;
    }

    setPlanPrompt({
      planId: plan._id,
      dayDate,
      entryType,
      plannedMealId,
      plannedMealName,
      servedMealId: mealId,
      servedMealName,
      servedAlready,
    });
  };

  const handlePlanPromptChoice = async (shouldReplace) => {
    if (!planPrompt) return;
    setPlanPromptSaving(true);

    try {
      if (shouldReplace) {
        await setPlanDayMeal(planPrompt.planId, {
          dayDate: planPrompt.dayDate,
          mealId: planPrompt.servedMealId,
        });
      }

      if (!planPrompt.servedAlready) {
        await servePlanDay(planPrompt.planId, {
          dayDate: planPrompt.dayDate,
          served: true,
          servedDate: planPrompt.dayDate,
        });
      }

      addToast({
        type: "success",
        title: shouldReplace ? "Plan updated" : "Plan left as-is",
        message: shouldReplace
          ? "Today's plan was replaced and marked as served."
          : "Today's plan was left unchanged and marked as served.",
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Plan update failed",
        message: err?.message || "Could not update today's plan.",
      });
    } finally {
      setPlanPromptSaving(false);
      setPlanPrompt(null);
    }
  };

  const handlePlanPromptNeverMind = () => {
    if (planPromptSaving) return;
    setPlanPrompt(null);
    addToast({
      type: "info",
      title: "No plan changes made",
      message: "Today's plan was left untouched.",
    });
  };

  const handleServe = async (mealId) => {
    setServingId(mealId);

    // optimistic UI update
    const prevMeals = meals;
    const prevSuggestions = suggestions;

    const optimisticPatch = (list) =>
      list.map((m) =>
        m._id === mealId
          ? {
              ...m,
              timesServed: (m.timesServed ?? 0) + 1,
              lastServed: new Date().toISOString(),
            }
          : m
      );

    setMeals((current) => optimisticPatch(current));
    setSuggestions((current) => optimisticPatch(current));

    try {
      const updated = await serveMeal(mealId);

      // replace optimistic meal with server truth
      setMeals((current) => current.map((m) => (m._id === mealId ? updated : m)));
      setSuggestions((current) => current.map((m) => (m._id === mealId ? updated : m)));

      // refresh suggestions order (since lastServed changed)
      const freshSuggestions = await getMealSuggestions(5);
      setSuggestions(freshSuggestions);

       if (mealId === todaysPlannedMealId) {
        setShowSuggestedTonight(false);
      }

      try {
        await updatePlanForServe(mealId);
      } catch (err) {
        console.error(err);
        addToast({
          type: "error",
          title: "Plan sync failed",
          message: err?.message || "Could not update today's plan.",
        });
      }

      setServeFeedbackId(mealId);
      if (serveFeedbackTimerRef.current) {
        clearTimeout(serveFeedbackTimerRef.current);
      }
      serveFeedbackTimerRef.current = setTimeout(() => {
        setServeFeedbackId("");
      }, 2000);  
    } catch (err) {
      console.error(err);

      // rollback
      setMeals(prevMeals);
      setSuggestions(prevSuggestions);

      addToast({
        type: "error",
        title: "Serve failed",
        message: "Could not update this meal. Please try again.",
      });
    } finally {
      setServingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              type="button"
              className="text-sm text-blue-700 hover:underline"
              disabled={loading}
            >
              Refresh
            </button>

          {isFreeTierLimitReached ? (
               <button
                type="button"
                onClick={() => setShowMealLimitModal(true)}
                className="rounded-lg bg-gray-400 px-4 py-2 text-white opacity-90"
                title="You have reached the free meal limit"
              >
                + Add Meal
              </button>
            ) : (
              <Link
                to="/app/meals/new"
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
              >
                + Add Meal
              </Link>
            )}
          </div>
        </div>

        {isFreeTierLimitReached && (
          <div className="mb-4">
            <UpgradePrompt
              trigger="meal_limit"
               title="You've reached the 12-meal limit"
              description="You've reached the 12-meal limit. Upgrade to Premium for unlimited meals + smart suggestions."
            />
          </div>
        )}


        {loading ? (
          <div className="bg-white rounded-xl p-6 shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow text-center">
            <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No meals yet</h2>
            <p className="text-gray-600 mb-5">Add your first meal to get started with planning and suggestions.</p>
            <Link
              to="/app/meals/new"
              className="inline-block bg-[rgb(127,155,130)] text-white rounded-lg px-5 py-2.5 hover:bg-[rgb(112,140,115)] transition"
            >
              + Add Meal
            </Link>
          </div>
        ) : (
          <>
             {shouldShowTonightPlan ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Tonight&apos;s Plan</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MealCard
                    key={todaysPlannedMeal._id}
                    meal={todaysPlannedMeal}
                    onServe={handleServe}
                    serving={servingId === todaysPlannedMeal._id}
                    serveLabel={
                      servingId === todaysPlannedMeal._id
                        ? "Serving..."
                        : serveFeedbackId === todaysPlannedMeal._id
                        ? "Served ✓"
                        : undefined
                    }
                  />
                </div>

                <div className="mt-3 text-sm">
                  <button
                    type="button"
                    className="text-blue-700 hover:underline"
                    onClick={() => setShowSuggestedTonight(true)}
                  >
                    Change of plans? View suggested meals instead.
                  </button>
                </div>
              </div>
            ) : suggestions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Suggested Tonight</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((meal) => (
                    <MealCard
                      key={meal._id}
                      meal={meal}
                      onServe={handleServe}
                      serving={servingId === meal._id}
                      serveLabel={
                        servingId === meal._id
                          ? "Serving..."
                          : serveFeedbackId === meal._id
                          ? "Served ✓"
                          : undefined
                      }
                    />
                  ))}
                </div>
                {todaysPlannedMeal && showSuggestedTonight && (
                  <div className="mt-3 text-sm">
                    <button
                      type="button"
                      className="text-blue-700 hover:underline"
                      onClick={() => setShowSuggestedTonight(false)}
                    >
                      Back to tonight&apos;s plan.
                    </button>
                  </div>
                )}
              </div>
            )}

             <div ref={mealLibraryRef} className="mb-3 flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl font-bold">Meal Library</h2>
              {isRestrictedFreeUser(user) && (
                <span className="text-sm text-gray-600">
                  {meals.length >= FREE_TIER_MEAL_LIMIT ? `You have ${FREE_TIER_MEAL_LIMIT}/${FREE_TIER_MEAL_LIMIT} meals` : `You have ${meals.length}/${FREE_TIER_MEAL_LIMIT} meals`}
                </span>
              )}
            </div>


             {isApproachingMealLimit && (
              <div className="mb-4 rounded-2xl border border-[#dce6de] bg-[#f8fbf8] p-4 shadow-sm sm:p-5">
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">You're close to your meal limit</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  You're at {meals.length}/{FREE_TIER_MEAL_LIMIT} meals. Upgrade now to keep adding meals without interruption.
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    to="/app/upgrade"
                    className="inline-flex items-center justify-center rounded-lg bg-[rgb(127,155,130)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgb(112,140,115)]"
                  >
                    Upgrade
                  </Link>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.map((meal) => (
                <MealCard
                  key={meal._id}
                  meal={meal}
                  onServe={handleServe}
                  serving={servingId === meal._id}
                  serveLabel={
                    servingId === meal._id
                      ? "Serving..."
                      : serveFeedbackId === meal._id
                      ? "Served ✓"
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>


    {showMealLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">Upgrade to Premium</h2>
            <p className="mt-2 text-sm text-gray-600">
              {"You’ve reached the 12-meal limit. Upgrade to Premium for unlimited meals + smart suggestions."}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowMealLimitModal(false);
                  mealLibraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Delete a meal
              </button>
              <Link
                to="/app/upgrade"
                className="rounded-lg bg-[rgb(127,155,130)] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(112,140,115)] text-center"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {planPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Update today&apos;s plan?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Today is planned for <span className="font-semibold">{planPrompt.plannedMealName}</span>,
              but you served <span className="font-semibold">{planPrompt.servedMealName}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                onClick={handlePlanPromptNeverMind}
                disabled={planPromptSaving}
              >
                Never mind
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => handlePlanPromptChoice(false)}
                disabled={planPromptSaving}
              >
                Serve without changing plan
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                onClick={() => handlePlanPromptChoice(true)}
                disabled={planPromptSaving}
              >
                Replace plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
