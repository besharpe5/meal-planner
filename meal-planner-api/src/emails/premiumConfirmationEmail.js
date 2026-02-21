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
  const planLabel =
    plan === "annual" ? "Annual" : plan === "monthly" ? "Monthly" : "Premium";

  const renewalDate = formatDate(expiresAt);

  // Environment-aware base URL
  const baseUrl = process.env.APP_URL || "https://mealplanned.io";

  const dashboardUrl = `${baseUrl}/app/dashboard`;

  const bodyContent = `
    <h2 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#111827;">
      You’re all set.
    </h2>

    <p style="margin:0 0 16px; color:#4b5563; font-size:15px; line-height:1.6;">
      Hi ${name}, your ${planLabel} subscription is now active. Your household now has full access to unlimited meals,
      smarter weekly planning, and complete meal history.
    </p>

    <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:1.6;">
      Decide once. Eat well. Move on.
    </p>

    <p style="margin:0 0 8px; font-size:15px; font-weight:600; color:#111827;">
      What Premium unlocks:
    </p>

    <ul style="margin:0 0 24px; padding-left:20px; color:#4b5563; font-size:15px; line-height:1.8;">
      <li>Unlimited meals for your entire household</li>
      <li>Smart weekly suggestions based on your history</li>
      <li>Full access to past planning history</li>
      <li>One shared system for everyone in your family</li>
    </ul>

    ${
      renewalDate
        ? `
    <div style="background:#f9fafb; border-radius:12px; padding:20px 24px; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:13px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">
        Next renewal
      </p>
      <p style="margin:0; font-size:17px; font-weight:600; color:#111827;">
        ${renewalDate}
      </p>
    </div>
    `
        : ""
    }

    ${ctaButton("Go to your dashboard", dashboardUrl)}

    <p style="margin:24px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
      You can manage or cancel your subscription anytime from your profile settings.
    </p>
  `;

  const footerContent = `
    &copy; 2026 MealPlanned &nbsp;&bull;&nbsp; Questions? Contact us at
    <a href="mailto:support@mealplanned.io" style="color:#9ca3af; text-decoration:underline;">
      support@mealplanned.io
    </a>
  `;

  return {
    subject: "Your MealPlanned subscription is active",
    html: emailLayout({
      previewText: `Your ${planLabel} subscription is active. Welcome to Premium!`,
      bodyContent,
      footerContent,
    }),
  };
}

module.exports = { premiumConfirmationEmail };