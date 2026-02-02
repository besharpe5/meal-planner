export default function Head() {
  return (
    <>
      <title>MealPlanned — Decide once. Eat well. Move on.</title>
      <meta
        name="description"
        content="Stop asking what’s for dinner. MealPlanned makes meal planning fast, flexible, and stress-free."
      />
      <link rel="canonical" href="https://mealplanned.io/" />

      {/* Open Graph */}
      <meta property="og:title" content="MealPlanned — Decide once. Eat well. Move on." />
      <meta
        property="og:description"
        content="Stop asking what’s for dinner. MealPlanned makes meal planning fast, flexible, and stress-free."
      />
      <meta property="og:url" content="https://mealplanned.io/" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
