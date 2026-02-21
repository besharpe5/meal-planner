#!/usr/bin/env node
/**
 * One-time beta invite email blast.
 *
 * Usage:
 *   node scripts/sendBetaInvites.js <emails-file> [--dry-run]
 *
 * The emails file should have one email address per line.
 * Lines starting with # are treated as comments and ignored.
 *
 * Examples:
 *   RESEND_API_KEY=re_xxx node scripts/sendBetaInvites.js beta-emails.txt
 *   node scripts/sendBetaInvites.js beta-emails.txt --dry-run
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const { betaInviteEmail } = require("../src/emails/betaInviteEmail");

const FROM_ADDRESS = process.env.EMAIL_FROM || "noreply@mail.mealplanned.io";
const DELAY_MS = 100; // pause between sends to respect rate limits

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseEmailsFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("@"));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const emailsFile = args.find((a) => !a.startsWith("--"));

  if (!emailsFile) {
    console.error("Usage: node scripts/sendBetaInvites.js <emails-file> [--dry-run]");
    process.exit(1);
  }

  const filePath = path.resolve(emailsFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  if (!dryRun && !process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Run with --dry-run or set the env var.");
    process.exit(1);
  }

  const emails = parseEmailsFile(filePath);
  if (emails.length === 0) {
    console.log("No email addresses found in file.");
    process.exit(0);
  }

  console.log(`\nBeta invite blast`);
  console.log(`  Emails:  ${emails.length}`);
  console.log(`  From:    ${FROM_ADDRESS}`);
  console.log(`  Mode:    ${dryRun ? "DRY RUN (no emails sent)" : "LIVE"}`);
  console.log("");

  const { subject, html } = betaInviteEmail();

  let sent = 0;
  let failed = 0;
  const resend = dryRun ? null : new Resend(process.env.RESEND_API_KEY);

  for (const email of emails) {
    if (dryRun) {
      console.log(`[dry-run] Would send to: ${email}`);
      sent++;
      continue;
    }

    try {
      await resend.emails.send({ from: FROM_ADDRESS, to: email, subject, html });
      console.log(`[sent] ${email}`);
      sent++;
    } catch (err) {
      console.error(`[failed] ${email} — ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
