import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],
  prerender: ["/", "/about"], // ✅ prerender only the landing page
};
