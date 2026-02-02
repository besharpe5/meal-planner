export default function Head() {
  return (
    <>
      <title>About MealPlanned</title>
      <meta
        name="description"
        content="Why MealPlanned exists: fewer food decisions, less decision fatigue, and a calmer way to plan meals."
      />
      <link rel="canonical" href="https://mealplanned.io/about" />

      {/* Open Graph */}
      <meta property="og:title" content="About MealPlanned" />
      <meta
        property="og:description"
        content="Why MealPlanned exists: fewer food decisions, less decision fatigue, and a calmer way to plan meals."
      />
      <meta property="og:url" content="https://mealplanned.io/about" />
      <meta property="og:type" content="article" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
