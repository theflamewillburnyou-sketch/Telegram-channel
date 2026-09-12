require("dotenv").config();

require("./newsJob");
require("./publishJob");
require("./marketJob");

const {
  runPerformanceJob
} = require("./performanceJob");

const cron = require("node-cron");


console.log(
  "\n========== MIDNIGHT SOCIETY SCHEDULER STARTED ==========\n"
);

console.log(
  "News Job: every 5 minutes"
);

console.log(
  "Publish Job: every 5 minutes"
);

console.log(
  "Market Job: every 5 minutes"
);

console.log(
  "Performance Job: every 30 minutes"
);


cron.schedule(
  "*/30 * * * *",
  runPerformanceJob
);
