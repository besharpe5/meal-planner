const { emailLayout, ctaButton } = require("./layout");

function passwordResetEmail({ name, resetToken }) {
  const appUrl = process.env.APP_URL || "https://mealplanned.io";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const bodyContent = `
    <h2 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#111827;">Password reset request</h2>
    <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:1.6;">
      Hi ${name}, we received a request to reset the password for your mealplanned account.
      Click the button below — this link expires in 1 hour.
    </p>

    ${ctaButton("Reset password", resetUrl)}

    <div style="margin-top:24px; padding:16px 20px; background:#fef9f0; border-radius:12px; border:1px solid #fde68a;">
      <p style="margin:0; color:#92400e; font-size:13px; line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your password won't change.
      </p>
    </div>
  `;

  return {
    subject: "Reset your mealplanned password",
    html: emailLayout({
      previewText: "Click to reset your mealplanned password. This link expires in 1 hour.",
      bodyContent,
    }),
  };
}

module.exports = { passwordResetEmail };
