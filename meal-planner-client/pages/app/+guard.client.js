// pages/app/+guard.client.js
import { redirect } from 'vike/abort';

export async function guard() {
  if (!document.cookie.includes("auth_flag")) throw redirect("/login");
}
