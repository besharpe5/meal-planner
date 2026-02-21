const { emailLayout, ctaButton } = require("./layout");

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function premiumConfirmationEmail({ name, plan, expiresAt }) {
  const planLabel = plan === "annual" ? "Annual" : plan === "monthly" ? "Monthly" : "Premium";
  const renewalDate = formatDate(expiresAt);

  const bodyContent = `
    <h2 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#111827;">Premium activated!</h2>
    <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:1.6;">
      Hi ${name}, your ${planLabel} subscription is now active. You have full access to all Premium features.
    </p>

    <p style="margin:0 0 8px; font-size:15px; font-weight:600; color:#111827;">What's included:</p>
    <ul style="margin:0 0 24px; padding-left:20px; color:#4b5563; font-size:15px; line-height:1.8;">
      <li>Unlimited meal planning</li>
      <li>Family sharing (up to 5 members)</li>
      <li>Weekly meal scheduling</li>
    </ul>

    ${renewalDate ? `
    <div style="background:#f9fafb; border-radius:12px; padding:20px 24px; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:13px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Next renewal</p>
      <p style="margin:0; font-size:17px; font-weight:600; color:#111827;">${renewalDate}</p>
    </div>
    ` : ""}

    ${ctaButton("Go to your dashboard", "https://mealplanned.io/app/dashboard")}

    <p style="margin:24px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
      Manage your subscription at any time from your profile settings.
    </p>
  `;

  return {
    subject: "You're now a mealplanned Premium member",
    html: emailLayout({
      previewText: `Your ${planLabel} subscription is active. Welcome to Premium!`,
      bodyContent,
    }),
  };
}

module.exports = { premiumConfirmationEmail };
