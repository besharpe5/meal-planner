import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "../../src/components/Link";

export default function ErrorPage() {
  const pageContext = usePageContext();
  const is404 = pageContext.is404;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <div className="text-5xl font-bold text-gray-300 mb-2">
          {is404 ? "404" : "500"}
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {is404 ? "Page not found" : "Something went wrong"}
        </h1>
        <p className="text-gray-600 mb-6">
          {is404
            ? "The page you're looking for doesn't exist or has been moved."
            : "An unexpected error occurred. Please try again."}
        </p>
        <Link
          to="/app/dashboard"
          className="inline-block bg-[rgb(127,155,130)] text-white rounded-lg px-5 py-2.5 hover:bg-[rgb(112,140,115)] transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
