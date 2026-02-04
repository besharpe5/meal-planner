export default function guard() {
  // Only runs in browser
  const token = (() => {
    try {
      const t = localStorage.getItem("token") || "";
      if (t === "undefined" || t === "null") return "";
      return t;
    } catch {
      return "";
    }
  })();

  // If not authed, block the page and send them to /login
  if (!token) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login?next=${next}`);
    return false;
  }

  return true;
}
