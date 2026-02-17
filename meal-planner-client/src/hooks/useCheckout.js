import { useCallback, useState } from "react";
import { createCheckoutSession } from "../services/billingService";

function mapCheckoutError(err) {
  if (err?.response?.data?.message) return err.response.data.message;

  const status = err?.response?.status;

  if (status === 400) return "Please choose a valid plan and try again.";
  if (status === 401) return "Please sign in to start checkout.";
  if (status === 403) return "Your account is not allowed to start checkout.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status && status >= 500) return "Checkout is temporarily unavailable. Please try again soon.";

  return "Could not start checkout right now.";
}

export function useCheckout() {
  const [activePlan, setActivePlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const startCheckout = useCallback(async (plan) => {
    setErrorMessage("");
    setActivePlan(plan);

    try {
      const res = await createCheckoutSession(plan);
      const checkoutUrl = res?.data?.url;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned.");
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      setErrorMessage(mapCheckoutError(err));
      setActivePlan(null);
    }
  }, []);

  return {
    activePlan,
    errorMessage,
    startCheckout,
  };
}