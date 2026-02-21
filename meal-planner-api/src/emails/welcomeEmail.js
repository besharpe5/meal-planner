const { emailLayout, ctaButton } = require("./layout");

function formatDate(date) {
  if (!date) return "soon";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function welcomeEmail({ name, trialExpiresAt }) {
  const trialEnd = formatDate(trialExpiresAt);
  const appUrl = process.env.APP_URL || "https://mealplanned.io";

  const bodyContent = `
    <h2 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#111827;">Welcome, ${name}!</h2>
    <p style="margin:0 0 20px; color:#4b5563; font-size:15px; line-height:1.6;">
       Your 14-day Premium trial is now active.
    </p>

    <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:1.6;">
      Decide once. Eat well. Move on.
    </p>

    <div style="background:#f9fafb; border-radius:12px; padding:20px 24px; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:13px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Trial ends</p>
      <p style="margin:0; font-size:17px; font-weight:600; color:#111827;">${trialEnd}</p>
    </div>

    <p style="margin:0 0 8px; font-size:15px; font-weight:600; color:#111827;">What's included in your trial:</p>
    <ul style="margin:0 0 24px; padding-left:20px; color:#4b5563; font-size:15px; line-height:1.8;">
      <li>Unlimited meals for your entire household</li>
      <li>Smart weekly suggestions based on your history</li>
      <li>Full access to past planning history</li>
      <li>One shared system for everyone in your family</li>
    </ul>

    ${ctaButton("Go to your dashboard", `${appUrl}/app/dashboard`)}

    <p style="margin:24px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
      After your trial, you can upgrade for $7/month or $55/year to keep all Premium features.
    </p>
  `;

  return {
    subject: "Welcome to mealplanned - your 14-day trial starts now",
    html: emailLayout({
      previewText: `Welcome, ${name}! Your 14-day Premium trial is now active.`,
      bodyContent,
    }),
  };
}

module.exports = { welcomeEmail };
