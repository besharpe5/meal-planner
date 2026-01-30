import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],
  prerender: ["/"], // ✅ prerender only the landing page
};
