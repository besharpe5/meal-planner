// pages/app/+guard.client.js
import { redirect } from 'vike/abort';

export async function guard() {
  const token = localStorage.getItem("token");
  if (!token) throw redirect("/login");
}
