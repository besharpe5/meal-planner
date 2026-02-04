import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],

  // Only prerender truly-public, static pages.
  // Do NOT prerender /app (it depends on auth and redirects/guards).
  prerender: ["/", "/about", "/privacy", "/login", "/register"],
};
