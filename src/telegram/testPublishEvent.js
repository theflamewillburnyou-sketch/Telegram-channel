const {
  getAllEvents
} = require("../database/eventRepository");

const {
  publishEvent
} = require("../jobs/publishJob");


async function test() {

  const events =
    getAllEvents();

  console.log(
    `Events available: ${events.length}`
  );


  if (events.length === 0) {

    console.log(
      "No events available."
    );

    return;
  }


  const event =
    events[0];


  console.log(
    "\n========== TEST EVENT ==========\n"
  );

  console.log(event);


  const result =
    await publishEvent(event);


  console.log(
    "\n========== PUBLISH RESULT ==========\n"
  );

  console.log(result);
}


test()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
