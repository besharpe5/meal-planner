const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(payload) {
  return resend.emails.send(payload);
}
