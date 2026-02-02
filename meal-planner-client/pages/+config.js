import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],
  prerender: ["/", "/about", "/app"], // ✅ prerender only the landing page
};
