import vikeReact from "vike-react/config";
import vikePhoton from "vike-photon/config";

export default {
  extends: [vikeReact, vikePhoton],

  // Only prerender truly public/static pages
  prerender: ["/", "/about", "/privacy", "/login", "/register", "/upgrade"],
};
