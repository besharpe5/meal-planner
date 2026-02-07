import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { getMe, updateEmail, updatePassword } from "../services/userService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Profile() {
  useDocumentTitle("MealPlanned | Profile");
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailUpdated, setEmailUpdated] = useState(false);
  const emailUpdatedTimeout = useRef(null);
  const [showEmailPw, setShowEmailPw] = useState(false);

  // password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const passwordUpdatedTimeout = useRef(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await getMe();
        setEmail(me.email);
        setNewEmail(me.email);
      } catch (err) {
        console.error(err);
        addToast({ type: "error", title: "Load failed", message: "Could not load profile." });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (emailUpdatedTimeout.current) {
        clearTimeout(emailUpdatedTimeout.current);
      }
      if (passwordUpdatedTimeout.current) {
        clearTimeout(passwordUpdatedTimeout.current);
      }
    },
    []
  );

  const submitEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      const res = await updateEmail(newEmail.trim().toLowerCase(), emailPassword);
      setEmail(res.email);
      setEmailPassword("");
      setEmailUpdated(true);
      if (emailUpdatedTimeout.current) {
        clearTimeout(emailUpdatedTimeout.current);
      }
      emailUpdatedTimeout.current = setTimeout(() => setEmailUpdated(false), 1500);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Email update failed",
        message: err?.response?.data?.message || "Could not update email.",
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordUpdated(true);
      if (passwordUpdatedTimeout.current) {
        clearTimeout(passwordUpdatedTimeout.current);
      }
      passwordUpdatedTimeout.current = setTimeout(() => setPasswordUpdated(false), 1500);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Password update failed",
        message: err?.response?.data?.message || "Could not update password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-sm text-gray-600">Signed in as <b>{email}</b></p>
        </div>

        {/* Update Email */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Update Email</h2>
          <form onSubmit={submitEmail} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">New email</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current password</label>
              <div className="relative">
                <input
                  className="w-full border rounded-lg p-2 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  type={showEmailPw ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPw((v) => !v)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showEmailPw ? "Hide password" : "Show password"}
                >
                  {showEmailPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex-1 bg-slate-600 text-white rounded-lg py-2 hover:bg-slate-700 disabled:opacity-60"
                disabled={savingEmail}
                type="submit"
              >
                {savingEmail ? "Saving..." : "Update Email"}
              </button>
              {emailUpdated && (
                <span className="text-sm text-green-600 font-medium">Updated ✓</span>
              )}
            </div>
          </form>
        </div>

        {/* Update Password */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Update Password</h2>
          <form onSubmit={submitPassword} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Current password</label>
              <div className="relative">
                <input
                  className="w-full border rounded-lg p-2 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrentPw ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New password (min 8 chars)</label>
              <div className="relative">
                <input
                  className="w-full border rounded-lg p-2 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPw ? "text" : "password"}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex-1 bg-[rgb(127,155,130)] text-white rounded-lg py-2 hover:bg-[rgb(112,140,115)] disabled:opacity-60"
                disabled={savingPassword}
                type="submit"
              >
                {savingPassword ? "Saving..." : "Update Password"}
              </button>
              {passwordUpdated && (
                <span className="text-sm text-green-600 font-medium">Updated ✓</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
