module.exports = function validateEnv() {
  const required = ["MONGO_URI", "JWT_SECRET"];

  const missing = required.filter(
    (k) => !process.env[k] || String(process.env[k]).trim() === ""
  );

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
