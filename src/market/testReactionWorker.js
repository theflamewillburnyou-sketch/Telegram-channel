const {
  getAllEvents
} = require("../database/eventRepository");

const {
  processMarketReaction
} = require("./reactionWorker");


const events =
  getAllEvents();


console.log(
  "Events:",
  events.length
);


if (events.length > 0) {

  const event =
    events[0];


  const result =
    processMarketReaction(
      event,
      "1H"
    );


  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

} else {

  console.log(
    "No events found in database."
  );

}
