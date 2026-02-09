// pages/app/+guard.client.js
import { redirect } from 'vike/abort';

export async function guard() {
  const hasFlag = (() => { try { return localStorage.getItem("auth_flag") === "1"; } catch { return false; } })();
  if (!hasFlag) throw redirect("/login");
}
