require("dotenv").config();

const { Bot } = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new Bot(token);

const CHANNEL_USERNAME = "@MidnightMarkets";

async function sendTestMessage() {
  try {
    const message = await bot.api.sendMessage({
      chat_id: CHANNEL_USERNAME,
      text: "🌙 Hello from Midnight Society!\n\nTelegram bot connection is working.",
    });

    console.log("Message sent successfully!");
    console.log("Message ID:", message.message_id);
  } catch (error) {
    console.error("Failed to send message:");
    console.error(error.message);
  }
}

sendTestMessage();
