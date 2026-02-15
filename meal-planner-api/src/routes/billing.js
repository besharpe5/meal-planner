const express = require("express");
const Stripe = require("stripe");
const auth = require("../middleware/auth");

const router = express.Router();


const PLAN_CONFIG = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    productId: process.env.STRIPE_PRODUCT_PREMIUM_MONTHLY,
    mode: "subscription",
  },
  annual: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
    productId: process.env.STRIPE_PRODUCT_PREMIUM_YEARLY,
    mode: "subscription",
  },
};

const clientUrl = (
  process.env.CLIENT_URL ||
  process.env.CLIENT_URLS?.split(",")[0]?.trim() ||
  "http://localhost:5173"
);

/**
 * POST /api/billing/create-checkout-session
 * Body: { plan: "monthly" | "annual" }
 * Returns: { url: "<stripe checkout url>" }
 */
router.post("/create-checkout-session", auth, async (req, res) => {
  try {
    const { plan } = req.body;

    const selectedPlan = PLAN_CONFIG[plan];
    if (!selectedPlan) {
      return res.status(400).json({
        message: 'Invalid plan. Must be "monthly" or "annual".',
      });
    }

    if (!selectedPlan.priceId) {
      console.error(`Stripe price ID not configured for plan: ${plan}`);
      return res.status(500).json({ message: "Billing is not configured for this plan." });
    }

    const user = req.user;
    if (user.isPremium && user.premiumSource !== "trial") {
      return res.status(409).json({
        code: "ALREADY_PREMIUM",
        message: "You already have an active premium subscription.",
      });
    }

 
    const successUrl = `${clientUrl}/app/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientUrl}/app/billing/cancel`;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sessionParams = {
      mode: selectedPlan.mode,
      payment_method_types: ["card"],
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(user._id),
      metadata: {
        userId: String(user._id),
        productId: selectedPlan.productId,
      },
    };

    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Create checkout session error:", err.message);
    return res.status(500).json({ message: "Failed to create checkout session." });
  }
});

module.exports = router;
