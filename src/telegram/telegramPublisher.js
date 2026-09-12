require("dotenv").config();

const { Bot } = require("node-telegram-bot-api");


const bot =
  new Bot(
    process.env.TELEGRAM_BOT_TOKEN
  );


const CHANNEL_ID =
  process.env.TELEGRAM_CHANNEL_ID;


async function publishMessage(
  message
) {

  if (!CHANNEL_ID) {
    throw new Error(
      "TELEGRAM_CHANNEL_ID is not configured"
    );
  }


  if (!message) {
    throw new Error(
      "Telegram message cannot be empty"
    );
  }


  const result =
    await bot.api.sendMessage({
      chat_id: CHANNEL_ID,
      text: message,
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true
      }
    });


  return result;
}


module.exports = {
  publishMessage
};
