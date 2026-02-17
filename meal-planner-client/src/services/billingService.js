import API from "./api";

export function createCheckoutSession(plan) {
  return API.post("/billing/create-checkout-session", { plan });
}