import API from "./api";

export function createCheckoutSession(plan) {
  return API.post("/billing/create-checkout-session", { plan });
}

export function createPortalSession() {
  return API.post("/billing/create-portal-session");
}