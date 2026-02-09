import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Users } from "lucide-react";
import { getInvitePreview, acceptInvite, getMe } from "../../../src/services/userService";
import { getMeals } from "../../../src/services/mealService";

export default function Page() {
  const pageContext = usePageContext();
  const code = pageContext.routeParams?.code;

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasMeals, setHasMeals] = useState(false);
  const [mergeMeals, setMergeMeals] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Preview invite (public, no auth needed)
        const preview = await getInvitePreview(code);
        setInvite(preview);

        // Check if user is logged in (auth_flag hint in localStorage)
        const hasFlag = (() => { try { return localStorage.getItem("auth_flag") === "1"; } catch { return false; } })();
        if (hasFlag) {
          try {
            await getMe();
            setLoggedIn(true);
            // Check if user has existing meals
            const meals = await getMeals();
            setHasMeals(meals && meals.length > 0);
          } catch {
            // Token invalid / expired
            setLoggedIn(false);
          }
        }
      } catch (err) {
        setInvite({ valid: false });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  async function handleAccept() {
    setAccepting(true);
    setError("");
    try {
      await acceptInvite(code, { mergeMeals: hasMeals ? mergeMeals : false });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/app/dashboard";
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Could not join family."
      );
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10 w-full max-w-md text-center text-gray-500">
          Loading invite...
        </div>
      </main>
    );
  }

  if (!invite || !invite.valid) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10 w-full max-w-md text-center">
          <div className="text-5xl text-gray-300 mb-4">?</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invite not found
          </h1>
          <p className="text-gray-600 mb-6">
            This invite link has expired, been revoked, or is invalid.
          </p>
          <a
            href="/login"
            className="inline-block bg-[rgb(127,155,130)] text-white rounded-xl px-5 py-2.5 hover:bg-[rgb(112,140,115)] transition font-semibold"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10 w-full max-w-md text-center">
          <div className="text-4xl mb-3">&#10003;</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to {invite.familyName}!
          </h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-[rgba(127,155,130,0.15)] flex items-center justify-center">
            <Users className="h-7 w-7 text-[rgb(127,155,130)]" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center text-gray-900 mb-1">
          You're invited!
        </h1>
        <p className="text-gray-600 text-center mb-6">
          <b>{invite.inviterName}</b> wants you to join{" "}
          <b>{invite.familyName}</b> on mealplanned.
        </p>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">
              Sign in or create an account to accept this invite.
            </p>
            <a
              href={`/login?next=${encodeURIComponent(`/invite/${code}`)}`}
              className="block w-full text-center rounded-xl px-4 py-3 font-semibold text-white bg-[rgb(127,155,130)] hover:bg-[rgb(112,140,115)] transition"
            >
              Log in
            </a>
            <a
              href={`/register?next=${encodeURIComponent(`/invite/${code}`)}`}
              className="block w-full text-center rounded-xl px-4 py-3 font-semibold text-[rgb(127,155,130)] border-2 border-[rgb(127,155,130)] hover:bg-gray-50 transition"
            >
              Create account
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {hasMeals && (
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  You have existing meals. What would you like to do?
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="merge"
                    checked={mergeMeals}
                    onChange={() => setMergeMeals(true)}
                    className="mt-1 accent-[rgb(127,155,130)]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Bring my meals
                    </div>
                    <div className="text-xs text-gray-500">
                      Your meals will be added to the shared family.
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="merge"
                    checked={!mergeMeals}
                    onChange={() => setMergeMeals(false)}
                    className="mt-1 accent-[rgb(127,155,130)]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Start fresh
                    </div>
                    <div className="text-xs text-gray-500">
                      Join with no meals. Your old meals won't carry over.
                    </div>
                  </div>
                </label>
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-[rgb(127,155,130)] hover:bg-[rgb(112,140,115)] disabled:opacity-60 transition"
            >
              {accepting ? "Joining..." : "Join family"}
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Invite expires{" "}
          {new Date(invite.expiresAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </main>
  );
}
