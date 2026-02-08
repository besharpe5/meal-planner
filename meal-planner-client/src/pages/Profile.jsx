import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Users, Copy, X, LogOut } from "lucide-react";
import { useToast } from "../context/ToastContext";
import {
  getMe,
  updateEmail,
  updatePassword,
  getFamily,
  updateFamilyName,
  createInvite,
  getInvites,
  revokeInvite,
  leaveFamily,
} from "../services/userService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Profile() {
  useDocumentTitle("MealPlanned | Profile");
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // family
  const [family, setFamily] = useState(null);
  const [editingFamilyName, setEditingFamilyName] = useState(false);
  const [familyNameDraft, setFamilyNameDraft] = useState("");
  const [invites, setInvites] = useState([]);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

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
        const [me, fam, inv] = await Promise.all([
          getMe(),
          getFamily(),
          getInvites(),
        ]);
        setEmail(me.email);
        setNewEmail(me.email);
        setFamily(fam);
        setFamilyNameDraft(fam.name);
        setInvites(inv);
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

  const saveFamilyName = async () => {
    const trimmed = familyNameDraft.trim();
    if (!trimmed || trimmed === family?.name) {
      setEditingFamilyName(false);
      return;
    }
    try {
      await updateFamilyName(trimmed);
      setFamily((f) => ({ ...f, name: trimmed }));
      setEditingFamilyName(false);
    } catch (err) {
      addToast({ type: "error", title: "Rename failed", message: err?.response?.data?.message || "Could not rename." });
    }
  };

  const handleCreateInvite = async () => {
    setCreatingInvite(true);
    try {
      const inv = await createInvite();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/invite/${inv.code}`;
      await navigator.clipboard.writeText(link);
      addToast({ type: "success", title: "Invite link copied", message: "Share it with someone to invite them." });
      setInvites((prev) => [{ code: inv.code, expiresAt: inv.expiresAt, createdAt: new Date().toISOString() }, ...prev]);
    } catch (err) {
      addToast({ type: "error", title: "Invite failed", message: err?.response?.data?.message || "Could not create invite." });
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevokeInvite = async (code) => {
    try {
      await revokeInvite(code);
      setInvites((prev) => prev.filter((i) => i.code !== code));
      addToast({ type: "success", title: "Invite revoked" });
    } catch (err) {
      addToast({ type: "error", title: "Revoke failed", message: err?.response?.data?.message || "Could not revoke." });
    }
  };

  const handleLeaveFamily = async () => {
    try {
      await leaveFamily();
      window.location.reload();
    } catch (err) {
      addToast({ type: "error", title: "Leave failed", message: err?.response?.data?.message || "Could not leave family." });
    }
    setConfirmLeave(false);
  };

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

        {/* Family */}
        {family && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-3">
              {editingFamilyName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    className="border rounded-lg px-2 py-1 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 min-w-0"
                    value={familyNameDraft}
                    onChange={(e) => setFamilyNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveFamilyName();
                      if (e.key === "Escape") {
                        setFamilyNameDraft(family.name);
                        setEditingFamilyName(false);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={saveFamilyName}
                    className="text-sm text-[rgb(127,155,130)] font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">{family.name}</h2>
                  <button
                    type="button"
                    onClick={() => setEditingFamilyName(true)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    edit
                  </button>
                </div>
              )}
            </div>

            {/* Members */}
            <div className="space-y-2 mb-4">
              {family.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {m.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="font-medium text-gray-900">{m.name}</span>
                  <span className="text-gray-400">{m.email}</span>
                </div>
              ))}
            </div>

            {/* Invite button */}
            <button
              type="button"
              onClick={handleCreateInvite}
              disabled={creatingInvite}
              className="w-full bg-[rgb(127,155,130)] text-white rounded-lg py-2 hover:bg-[rgb(112,140,115)] disabled:opacity-60 font-medium flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {creatingInvite ? "Creating..." : "Copy invite link"}
            </button>

            {/* Active invites */}
            {invites.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Active invites
                </h3>
                <div className="space-y-2">
                  {invites.map((inv) => (
                    <div
                      key={inv.code}
                      className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-600 font-mono text-xs truncate">
                        ...{inv.code.slice(-8)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          expires{" "}
                          {new Date(inv.expiresAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(inv.code)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Revoke invite"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leave family (only if multi-member) */}
            {family.members?.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {confirmLeave ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Are you sure? You'll be moved to your own family. Shared meals stay with this family.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleLeaveFamily}
                        className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-600"
                      >
                        Leave
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmLeave(false)}
                        className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmLeave(true)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Leave family
                  </button>
                )}
              </div>
            )}
          </div>
        )}

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
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 min-w-0 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  type={showEmailPw ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPw((v) => !v)}
                  className="shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
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
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 min-w-0 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrentPw ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New password (min 8 chars)</label>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 min-w-0 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPw ? "text" : "password"}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
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
