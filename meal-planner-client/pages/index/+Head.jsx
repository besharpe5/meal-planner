export default function Head() {
  return (
    <>
      <title>mealplanned - Decide once. Eat well. Move on.</title>
      <meta
        name="description"
        content="MealPlanned keeps your meal rotation in check—without turning planning into a mental chore."
      />
      <link rel="canonical" href="https://mealplanned.io/" />

      {/* Open Graph */}
      <meta property="og:title" content="mealplanned - Decide once. Eat well. Move on." />
      <meta
        property="og:description"
        content="MealPlanned keeps your meal rotation in check—without turning planning into a mental chore."
      />
      <meta property="og:url" content="https://mealplanned.io/" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
