const { emailLayout, ctaButton } = require("./layout");

function betaInviteEmail() {
  const appUrl = process.env.APP_URL || "https://mealplanned.io";

  const bodyContent = `
    <h2 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#111827;">You're one of the first</h2>
    <p style="margin:0 0 20px; color:#4b5563; font-size:15px; line-height:1.6;">
      Thanks for signing up for early access to mealplanned. Your account comes with a <strong>14-day free Premium trial</strong>, and as a beta member we're offering you a special rate.
    </p>

    <div style="background:#f0f7f1; border-radius:12px; padding:20px 24px; margin-bottom:24px; border:1px solid #c6dfc8;">
      <p style="margin:0 0 4px; font-size:13px; font-weight:600; color:#4a7c52; text-transform:uppercase; letter-spacing:0.5px;">Beta member rate</p>
      <p style="margin:0; font-size:20px; font-weight:700; color:#111827;">$55<span style="font-size:14px; font-weight:500; color:#6b7280;">/year</span></p>
      <p style="margin:4px 0 0; font-size:13px; color:#4b5563;">Upgrade at this price anytime during or after your trial.</p>
    </div>

    <p style="margin:0 0 8px; font-size:15px; font-weight:600; color:#111827;">What you'll get:</p>
    <ul style="margin:0 0 24px; padding-left:20px; color:#4b5563; font-size:15px; line-height:1.8;">
       <li>Plan your whole week in minutes</li>
      <li>Smart suggestions based on what you've made before</li>
      <li>Shared planning for your entire household</li>
    </ul>

    ${ctaButton("Create your account", `${appUrl}/register`)}

    <p style="margin:24px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
       Questions or feedback? Reach us at
      <a href="mailto:support@mealplanned.io" style="color:#6b7280; text-decoration:underline;">
        support@mealplanned.io
      </a>
       — we read every email.
    </p>
  `;

  return {
    subject: "You're in - mealplanned beta access",
    html: emailLayout({
      previewText: "Your beta access is ready. Start your 14-day free trial today.",
      bodyContent,
    }),
  };
}

module.exports = { betaInviteEmail };
