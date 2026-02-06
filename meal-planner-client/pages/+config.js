import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],

  // Only prerender truly public/static pages
  prerender: ["/", "/about", "/privacy", "/login", "/register"],
};
