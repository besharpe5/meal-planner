const { emailLayout, ctaButton } = require("./layout");

function formatDate(date) {
  if (!date) return "soon";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function familyInviteEmail({ inviterName, familyName, inviteCode, expiresAt }) {
  const appUrl = process.env.APP_URL || "https://mealplanned.io";
  const inviteUrl = `${appUrl}/invite/${inviteCode}`;
  const expiryDate = formatDate(expiresAt);

  const bodyContent = `
    <h2 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#111827;">You're invited to join ${familyName}</h2>
    <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:1.6;">
       ${inviterName} has invited you to join their family on mealplanned — a calmer way to plan meals together.
    </p>

    ${ctaButton("Accept invitation", inviteUrl)}

    <p style="margin:20px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
      This invite expires on ${expiryDate}. If you don't have a mealplanned account yet, you'll be asked to create one — it's free.
    </p>
  `;

  return {
    subject: `${inviterName} invited you to join ${familyName} on mealplanned`,
    html: emailLayout({
      previewText: `${inviterName} wants you to join ${familyName} on mealplanned.`,
      bodyContent,
    }),
  };
}

module.exports = { familyInviteEmail };
