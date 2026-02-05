import MealDetail from "../../../../src/pages/MealDetail";

export default function Page(pageContext) {
   return <MealDetail mealId={pageContext.routeParams?.id} />;
}