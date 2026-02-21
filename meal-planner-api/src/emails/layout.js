function ctaButton(text, url) {
  return `<a href="${url}" style="display:inline-block; background:#7F9B82; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:12px; font-weight:600; font-size:15px; margin-top:8px;">${text}</a>`;
}

function emailLayout({ previewText = "", bodyContent }) {
  // Invisible previewText spacer (150 chars of hidden whitespace after the real preview text)
  const spacer = "&nbsp;".repeat(150);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>mealplanned</title>
</head>
<body style="margin:0; padding:32px 16px; background:#f5f5f0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1f2937;">

  <!-- Preview text -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    ${previewText}${spacer}
  </div>

  <!-- Outer container -->
  <div style="max-width:600px; margin:0 auto;">

    <!-- Header -->
    <div style="background:#7F9B82; border-radius:16px 16px 0 0; padding:24px 32px;">
      <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:-0.3px;">mealplanned</span>
    </div>

    <!-- Body card -->
    <div style="background:#ffffff; padding:36px 32px; border-radius:0 0 16px 16px; border:1px solid #e5e7eb; border-top:none;">
      ${bodyContent}
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px 16px; color:#9ca3af; font-size:12px; line-height:1.6;">
       &copy; 2026 MealPlanned &nbsp;&bull;&nbsp; Questions? Contact us at
      <a href="mailto:support@mealplanned.io" style="color:#9ca3af; text-decoration:underline;">
        support@mealplanned.io
      </a>
    </div>

  </div>
</body>
</html>`;
}

module.exports = { emailLayout, ctaButton };