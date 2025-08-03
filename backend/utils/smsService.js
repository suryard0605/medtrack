// backend/utils/smsService.js
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, message) {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE, // Your Twilio number
      to: to // must be in format +91XXXXXXXXXX
    });
    console.log(`✅ SMS sent to ${to}`);
  } catch (error) {
    console.error(`❌ SMS failed to ${to}:`, error.message);
  }
}

module.exports = { sendSMS };
