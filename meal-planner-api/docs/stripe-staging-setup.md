# Stripe Staging Webhook Setup

Use this checklist whenever configuring Stripe webhooks for the staging API.

1. In the Stripe Dashboard, switch to **Test mode**.
2. Create (or edit) the staging webhook endpoint URL:
   - `https://<staging-api-domain>/api/billing/webhook`
3. In endpoint event selection, enable the required billing events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - Add any additional invoice/subscription events required by current staging tests.
4. Copy the generated webhook signing secret (`whsec_...`) and set it in staging environment config as:
   - `STRIPE_WEBHOOK_SECRET=<copied-signing-secret>`
5. Verify end-to-end delivery:
   - Use Stripe test events (or trigger test checkout/subscription flows) in Test mode.
   - Confirm staging API logs show successful webhook signature verification and event processing.
6. Record and follow rotation procedure for both webhook secret and test API keys:
   - Rotate on a defined cadence (for example, quarterly) or immediately after suspected exposure.
   - Update staging environment variables, redeploy, and re-run webhook delivery verification.
   - Keep a dated audit note of who rotated keys/secrets, when, and validation results.
