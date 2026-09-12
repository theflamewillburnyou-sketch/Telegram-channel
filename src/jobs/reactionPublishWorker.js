const {
  getEventsWithSnapshots
} = require("../database/eventRepository");

const {
  getMarketReaction
} = require("../database/reactionRepository");

const {
  isReactionPublished,
  savePublishedReaction
} = require("../database/reactionPublishRepository");

const {
  buildMarketReactionMessage
} = require("../telegram/marketReactionMessage");

const {
  publishMessage
} = require("../telegram/telegramPublisher");


const HORIZONS = [
  "1H",
  "1D",
  "1W"
];


async function publishMarketReactions() {

  console.log(
    "\n========== REACTION PUBLISH START ==========\n"
  );


  const events =
    getEventsWithSnapshots();


  for (const event of events) {

    for (const horizon of HORIZONS) {

      /*
       * Does a reaction actually exist?
       */

      const reaction =
        getMarketReaction(
          event.eventId,
          horizon
        );


      if (!reaction) {

        console.log(
          `${event.eventId} ${horizon}: no reaction yet`
        );

        continue;
      }


      /*
       * Was this reaction already
       * published to Telegram?
       */

      if (
        isReactionPublished(
          event.eventId,
          horizon
        )
      ) {

        console.log(
          `${event.eventId} ${horizon}: already published`
        );

        continue;
      }


      /*
       * Build Telegram message
       */

      const message =
        buildMarketReactionMessage(
          event,
          reaction
        );


      if (!message) {

        console.log(
          `${event.eventId} ${horizon}: empty message`
        );

        continue;
      }


      console.log(
        "\n========== REACTION TELEGRAM MESSAGE ==========\n"
      );

      console.log(message);


      const result =
        await publishMessage(
          message
        );


      savePublishedReaction(
        event.eventId,
        horizon,
        result.message_id
      );


      console.log(
        `${event.eventId} ${horizon}: reaction published`
      );
    }
  }


  console.log(
    "\n========== REACTION PUBLISH COMPLETE ==========\n"
  );
}


module.exports = {
  publishMarketReactions
};
