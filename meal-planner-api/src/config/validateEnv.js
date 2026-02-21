module.exports = function validateEnv() {
  const required = ["MONGO_URI", "JWT_SECRET"];
   const emailRequired = ["RESEND_API_KEY", "EMAIL_FROM"];
  const validEmailModes = ["live", "whitelist", "log"];

  const stripeRequired = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRODUCT_PREMIUM_MONTHLY",
    "STRIPE_PRODUCT_PREMIUM_YEARLY",
    "STRIPE_PRICE_PREMIUM_MONTHLY",
    "STRIPE_PRICE_PREMIUM_YEARLY",
  ];

  // Stripe env vars are mandatory in production by default.
  // Local/dev environments can opt in with STRIPE_ENABLED=true.
  const stripeEnabled =
    process.env.STRIPE_ENABLED === "true" || process.env.NODE_ENV === "production";

  if (stripeEnabled) {
    required.push(...stripeRequired);
  }

  const rawEmailMode = String(process.env.EMAIL_MODE || "").trim();
  const emailMode = rawEmailMode.toLowerCase();

  if (!validEmailModes.includes(emailMode)) {
    throw new Error(
      `Invalid EMAIL_MODE value: ${rawEmailMode || "(empty)"}. Expected one of: ${validEmailModes.join(
        ", "
      )}.`
    );
  }

  const emailSendingEnabled = emailMode === "live" || emailMode === "whitelist";

  if (emailSendingEnabled) {
    required.push(...emailRequired);
  }

  if (emailMode === "whitelist") {
    required.push("EMAIL_WHITELIST");
  }


  const missing = required.filter(
    (k) => !process.env[k] || String(process.env[k]).trim() === ""
  );

  if (missing.length) {
    const stripeMissing = missing.filter((k) => stripeRequired.includes(k));
     const emailMissing = missing.filter(
      (k) => emailRequired.includes(k) || k === "EMAIL_WHITELIST"
    );
    const baseMissing = missing.filter(
      (k) => !stripeRequired.includes(k) && !emailMissing.includes(k)
    );
    const messageParts = [];

    if (baseMissing.length) {
      messageParts.push(`Missing required environment variables: ${baseMissing.join(", ")}`);
    }

    if (stripeMissing.length) {
      messageParts.push(
        `Missing required Stripe environment variables (${stripeEnabled ? "Stripe is enabled" : "Stripe is disabled"}): ${stripeMissing.join(", ")}`
      );
    }

     if (emailMissing.length) {
      messageParts.push(
        `Missing required email environment variables (EMAIL_MODE=${emailMode}): ${emailMissing.join(", ")}`
      );
    }

    throw new Error(messageParts.join(". "));
  }
};
