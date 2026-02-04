import React from "react";
import Navbar from "../../src/components/Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="pb-20 md:pb-0">{children}</div>
    </>
  );
}
