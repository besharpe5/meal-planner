// pages/about/+Head.jsx
export default function Head() {
  const title = "About MealPlanned";
  const description =
    "Why MealPlanned exists: fewer food decisions, less decision fatigue, and a calmer way to plan meals.";
  const url = "https://mealplanned.io/about";

  // Use an image you actually have in /public (recommended path):
  // public/og/about.png  ->  https://mealplanned.io/og/about.png
  // TODO: need to create this still
  const image = "https://mealplanned.io/og/about.png";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content="MealPlanned" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
