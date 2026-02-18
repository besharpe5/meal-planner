module.exports = function validateEnv() {
  const required = ["MONGO_URI", "JWT_SECRET"];

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


  const missing = required.filter(
    (k) => !process.env[k] || String(process.env[k]).trim() === ""
  );

  if (missing.length) {
    const stripeMissing = missing.filter((k) => stripeRequired.includes(k));
    const baseMissing = missing.filter((k) => !stripeRequired.includes(k));

    const messageParts = [];

    if (baseMissing.length) {
      messageParts.push(`Missing required environment variables: ${baseMissing.join(", ")}`);
    }

    if (stripeMissing.length) {
      messageParts.push(
        `Missing required Stripe environment variables (${stripeEnabled ? "Stripe is enabled" : "Stripe is disabled"}): ${stripeMissing.join(", ")}`
      );
    }

    throw new Error(messageParts.join(". "));
  }
};
