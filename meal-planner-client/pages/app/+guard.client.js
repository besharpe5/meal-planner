export async function guard(pageContext) {
  // Vike guard runs on server too sometimes; localStorage doesn't exist there.
  // We only enforce auth on the client.
  if (!pageContext.isClientSide) return;

  try {
    const t = localStorage.getItem("token");
    const token = t && t !== "undefined" && t !== "null" ? t : "";

    if (!token) {
      const next = encodeURIComponent(pageContext.urlPathname + pageContext.urlParsed.searchOriginal);
      throw pageContext.redirect(`/login?next=${next}`);
    }
  } catch {
    const next = encodeURIComponent(pageContext.urlPathname + pageContext.urlParsed.searchOriginal);
    throw pageContext.redirect(`/login?next=${next}`);
  }
}
