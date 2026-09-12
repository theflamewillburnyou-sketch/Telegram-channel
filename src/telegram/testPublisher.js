const {
  publishMessage
} = require("./telegramPublisher");


async function main() {

  try {

    const result =
      await publishMessage(
        "🧪 <b>Midnight Society</b>\n\nTelegram publishing is working."
      );


    console.log(
      "Message sent successfully."
    );

    console.log(
      "Message ID:",
      result.message_id
    );

  } catch (error) {

    console.error(
      "Telegram publishing failed:",
      error.message
    );

  }

}


main();
