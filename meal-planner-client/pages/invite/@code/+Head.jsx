export default function Head() {
  const inviteDescription = "Let's plan meals together! Join my family on MealPlanned.";

  return (
    <>
      <title>MealPlanned Family Invite</title>
      <meta name="description" content={inviteDescription} />
      <meta property="og:title" content="MealPlanned Family Invite" />
      <meta property="og:description" content={inviteDescription} />
      <meta name="twitter:description" content={inviteDescription} />
    </>
  );
}