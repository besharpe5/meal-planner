import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],
  prerender: true, // generates real HTML at build-time for pages (SSG)
};
