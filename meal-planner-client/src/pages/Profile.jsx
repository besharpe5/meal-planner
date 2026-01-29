import { useEffect, useRef, useState } from "react";
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

  // password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const passwordUpdatedTimeout = useRef(null);

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
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
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
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New password (min 8 chars)</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                minLength={8}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 disabled:opacity-60"
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
