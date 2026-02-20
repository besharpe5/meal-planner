const crypto = require("crypto");
const express = require("express");
const Stripe = require("stripe");

const User = require("../models/User");
const Family = require("../models/Family");
const StripeWebhookEvent = require("../models/StripeWebhookEvent");
const { invalidateFamilyPremiumStatus } = require("../services/familyService");

const router = express.Router();

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "unpaid"]);

const stripePlanByProductId = {
  [process.env.STRIPE_PRODUCT_PREMIUM_MONTHLY]: {
    key: "premium_monthly",
    premiumPlan: "monthly",
    interval: "month",
    intervalCount: 1,
    premiumSource: "stripe",
  },
  [process.env.STRIPE_PRODUCT_PREMIUM_YEARLY]: {
    key: "premium_yearly",
    premiumPlan: "annual",
    interval: "year",
    intervalCount: 1,
    premiumSource: "stripe",
  },
};

function verifyStripeSignature(rawBody, signatureHeader, webhookSecret) {
  if (!signatureHeader || !webhookSecret) {
    return false;
  }

  const pieces = signatureHeader.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const timestamp = pieces.t;
  const signature = pieces.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

function resolvePlan(productId) {
  if (!productId) return null;
  return stripePlanByProductId[productId] || null;
}

async function findUserForCheckout(session) {
  const metadataUserId = session?.metadata?.userId || session?.client_reference_id;
  if (metadataUserId) {
    const userById = await User.findById(metadataUserId);
    if (userById) return userById;
  }

  const checkoutEmail = session?.customer_details?.email || session?.customer_email;
  if (checkoutEmail) {
    return User.findOne({ email: String(checkoutEmail).trim().toLowerCase() });
  }

  return null;
}

async function findUserForSubscription(subscription) {
  const metadataUserId = subscription?.metadata?.userId;
  if (metadataUserId) {
    const userById = await User.findById(metadataUserId);
    if (userById) return userById;
  }

  const subscriptionId = subscription?.id;
  const customerId = subscription?.customer;

  const query = [];
  if (subscriptionId) query.push({ stripeSubscriptionId: subscriptionId });
  if (customerId) query.push({ stripeCustomerId: customerId });

  if (query.length > 0) {
    return User.findOne({ $or: query });
  }

  return null;
}

function getPrimaryProductIdFromSubscription(subscription) {
  return subscription?.items?.data?.[0]?.price?.product || null;
}


async function updateStripeCustomerDescription(customerId, user) {
  if (!customerId || !process.env.STRIPE_SECRET_KEY) return;

  const family = await Family.findById(user.family).populate("members", "_id");
  const memberCount = family?.members?.length || 1;
  const familyName = family?.name || "My Family";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  await stripe.customers.update(customerId, {
    description: `${user.name} - ${familyName} (${memberCount} members)`,
    metadata: {
      familyId: String(user.family),
      familyName,
      familyMemberCount: String(memberCount),
      planTier: "premium",
    },
  });
}

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signatureHeader = req.headers["stripe-signature"];
  const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return res.status(500).send("Webhook secret is not configured");
  }

  if (!verifyStripeSignature(rawBody, signatureHeader, webhookSecret)) {
    return res.status(400).send("Invalid webhook signature");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).send("Invalid JSON payload");
  }

  let eventRecord = await StripeWebhookEvent.findOne({ eventId: event.id });
  if (eventRecord?.status === "processed") {
    return res.status(200).json({ received: true, duplicate: true });
  }

  if (!eventRecord) {
    eventRecord = await StripeWebhookEvent.create({
      eventId: event.id,
      eventType: event.type,
      status: "processing",
    });
  } else {
    eventRecord.status = "processing";
    eventRecord.lastError = null;
    await eventRecord.save();
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const user = await findUserForCheckout(session);
        if (!user) break;

        const productId = session?.metadata?.productId || null;
        const plan = resolvePlan(productId);

        user.isPremium = true;
        user.hasEverPaid = true;
        user.premiumStartedAt = user.premiumStartedAt || new Date();
        user.premiumSource = plan?.premiumSource || "stripe";
        user.premiumPlan = plan?.premiumPlan || user.premiumPlan || null;
        user.stripeCustomerId = session?.customer || user.stripeCustomerId || null;
        user.stripeSubscriptionId = session?.subscription || user.stripeSubscriptionId || null;

        if (plan?.interval === "lifetime") {
          user.premiumExpiresAt = null;
        }

        await user.save();
        invalidateFamilyPremiumStatus(user.family);

        try {
          await updateStripeCustomerDescription(user.stripeCustomerId, user);
        } catch (error) {
          console.error("Failed to update Stripe customer description:", error.message);
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await findUserForSubscription(subscription);

        if (!user) break;

        const productId = getPrimaryProductIdFromSubscription(subscription);
        const plan = resolvePlan(productId);
        const isActive = ACTIVE_SUBSCRIPTION_STATUSES.has(subscription?.status);

        user.stripeCustomerId = subscription?.customer || user.stripeCustomerId || null;
        user.stripeSubscriptionId = subscription?.id || user.stripeSubscriptionId || null;

        if (!plan) {
          console.warn(`Unmapped Stripe product ID: ${productId || "(empty)"}`);
        }

        if (isActive) {


          user.isPremium = true;
          user.hasEverPaid = true;
          user.premiumSource = plan?.premiumSource || "stripe";
           user.premiumPlan = plan?.premiumPlan || user.premiumPlan || null;
          if (!user.premiumStartedAt) {
            user.premiumStartedAt = new Date((subscription?.start_date || Date.now() / 1000) * 1000);
          }

          if (plan?.interval === "lifetime") {
            user.premiumExpiresAt = null;
          } else {
            user.premiumExpiresAt = subscription?.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : user.premiumExpiresAt;
          }
        } else {
          user.isPremium = false;
          user.premiumPlan = null;
          if (!user.premiumSource) {
            user.premiumSource = plan?.premiumSource || "stripe";
          }
          user.premiumExpiresAt = subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : new Date();
        }

        await user.save();
        invalidateFamilyPremiumStatus(user.family);

        try {
          await updateStripeCustomerDescription(user.stripeCustomerId, user);
        } catch (error) {
          console.error("Failed to update Stripe customer description:", error.message);
        }
        break;
      }

      default:
        break;
    }

    eventRecord.status = "processed";
    eventRecord.lastError = null;
    await eventRecord.save();

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handling error:", err);

    eventRecord.status = "failed";
    eventRecord.lastError = err?.message || "Unknown error";
    await eventRecord.save();

    return res.status(500).send("Webhook processing failed");
  }
});

module.exports = router;