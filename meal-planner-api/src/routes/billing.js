const express = require("express");
const Stripe = require("stripe");
const auth = require("../middleware/auth");
const Family = require("../models/Family");
const { isTrialActive } = require("../utils/trial");

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Stripe billing is not configured. Missing STRIPE_SECRET_KEY.",
      });
    }

    const user = req.user;
    const familyPremiumMemberId = user.familyPremiumMember?._id
      ? String(user.familyPremiumMember._id)
      : null;
    const isCurrentUserFamilyPremiumMember = familyPremiumMemberId === String(user._id);
    const userHasActiveTrial = isTrialActive(user);
    const isFamilyPremiumViaActiveTrial =
      user.isFamilyPremium &&
      user.familyPremiumMember?.premiumSource === "trial" &&
      (!isCurrentUserFamilyPremiumMember || userHasActiveTrial);

    if (user.isFamilyPremium && !isFamilyPremiumViaActiveTrial) {
      return res.status(409).json({
        code: "ALREADY_PREMIUM",
        message: "Your family already has an active premium subscription.",
      });
    }

    const successUrl = `${clientUrl}/app/profile?success=true`;
    const cancelUrl = `${clientUrl}/app/upgrade`;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const family = await Family.findById(user.family).populate("members", "_id");
    const familyMembers = family?.members || [];

    const sessionParams = {
      mode: selectedPlan.mode,
      payment_method_types: ["card"],
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(user._id),
      metadata: {
        userId: String(user._id),
        familyId: String(user.family),
        familyName: family?.name || "My Family",
        familyMemberCount: String(familyMembers.length),
        userEmail: user.email,
        productId: selectedPlan.productId,
        planTier: "premium",
        is_family_premium: "true",
      },
    };

    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
      sessionParams.customer_update = { name: "auto" };
    } else {
      sessionParams.customer_email = user.email;
    }
    sessionParams.subscription_data = {
      metadata: {
        userId: String(user._id),
        familyId: String(user.family),
        family_size: String(familyMembers.length),
        plan_tier: "premium",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Create checkout session error:", err.message);
    return res.status(500).json({ message: "Failed to create checkout session." });
  }
});

/**
 * POST /api/billing/create-portal-session
 * Returns: { url: "<stripe billing portal url>" }
 */
router.post("/create-portal-session", auth, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      message: "Stripe billing is not configured. Missing STRIPE_SECRET_KEY.",
    });
  }

  if (!req.user?.stripeCustomerId) {
    return res.status(400).json({
      message: "No Stripe customer is associated with this account.",
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const returnUrl = `${clientUrl}/app/profile`;

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: returnUrl,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Create portal session error:", err.message);
    return res.status(502).json({
      message: "Failed to create billing portal session with Stripe.",
    });
  }
});

module.exports = router;
