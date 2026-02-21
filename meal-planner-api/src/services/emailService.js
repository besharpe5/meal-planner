const { Resend } = require("resend");
const { welcomeEmail } = require("../emails/welcomeEmail");
const { familyInviteEmail } = require("../emails/familyInviteEmail");
const { passwordResetEmail } = require("../emails/passwordResetEmail");
const { premiumConfirmationEmail } = require("../emails/premiumConfirmationEmail");

const EMAIL_MODE = (process.env.EMAIL_MODE || "log").toLowerCase();
const FROM_ADDRESS = process.env.EMAIL_FROM || "noreply@mail.mealplanned.io";

const EMAIL_WHITELIST = (process.env.EMAIL_WHITELIST || "")
  .split(/[\s,]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function sendEmail({ to, subject, html }) {
  if (EMAIL_MODE === "log") {
    console.log(`[email:log] TO=${to} | SUBJECT=${subject}`);
    return { ok: true, mode: "log" };
  }

  if (EMAIL_MODE === "whitelist") {
    if (!EMAIL_WHITELIST.includes(to.toLowerCase())) {
      console.log(`[email:whitelist] Suppressed to ${to} (not in whitelist)`);
      return { ok: true, mode: "suppressed" };
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
}

async function sendWelcomeEmail(user) {
  const { subject, html } = welcomeEmail({
    name: user.name,
    trialExpiresAt: user.premiumExpiresAt,
  });
  return sendEmail({ to: user.email, subject, html });
}

async function sendFamilyInviteEmail({ recipientEmail, inviterName, familyName, inviteCode, expiresAt }) {
  const { subject, html } = familyInviteEmail({ inviterName, familyName, inviteCode, expiresAt });
  return sendEmail({ to: recipientEmail, subject, html });
}

async function sendPasswordResetEmail(user, resetToken) {
  const { subject, html } = passwordResetEmail({ name: user.name, resetToken });
  return sendEmail({ to: user.email, subject, html });
}

async function sendPremiumConfirmationEmail(user) {
  const { subject, html } = premiumConfirmationEmail({
    name: user.name,
    plan: user.premiumPlan,
    expiresAt: user.premiumExpiresAt,
  });
  return sendEmail({ to: user.email, subject, html });
}

module.exports = {
  sendWelcomeEmail,
  sendFamilyInviteEmail,
  sendPasswordResetEmail,
  sendPremiumConfirmationEmail,
};
