import React from "react";
import MealDetail from "../../../../src/pages/MealDetail";

export default function Page(pageContext) {
  // Vike route params are at pageContext.routeParams
  // But vike-react also passes pageContext differently depending on setup.
  // Safer: MealDetail should read the ID from location OR accept it via props.
  return <MealDetail />;
}
