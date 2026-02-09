const crypto = require("crypto");

const IS_PROD = process.env.NODE_ENV !== "development";

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const COOKIE_OPTS_BASE = {
  secure: IS_PROD,
  sameSite: IS_PROD ? "none" : "lax",
};

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, {
    ...COOKIE_OPTS_BASE,
    httpOnly: true,
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });

  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTS_BASE,
    httpOnly: true,
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE,
  });
}

function clearTokenCookies(res) {
  res.clearCookie("access_token", {
    ...COOKIE_OPTS_BASE,
    httpOnly: true,
    path: "/",
  });

  res.clearCookie("refresh_token", {
    ...COOKIE_OPTS_BASE,
    httpOnly: true,
    path: "/api/auth",
  });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { setTokenCookies, clearTokenCookies, hashToken, REFRESH_MAX_AGE };
