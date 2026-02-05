import EditMeal from "../../../../../src/pages/EditMeal";

export default function Page(pageContext) {
  return <EditMeal mealId={pageContext.routeParams?.id} />;
}
