export default function Page() {
  if (typeof window !== "undefined") {
    window.location.replace("/app/dashboard");
  }
  return null;
}
