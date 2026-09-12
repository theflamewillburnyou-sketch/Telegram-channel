const {
  getAmericasOilWatchPrice
} = require("./prices");

async function test() {
  console.log("\n========== BRENT ==========\n");

  const brent =
    await getAmericasOilWatchPrice("BRENT");

  console.log(brent);

  console.log("\n========== WTI ==========\n");

  const wti =
    await getAmericasOilWatchPrice("WTI");

  console.log(wti);
}

test().catch(error => {
  console.error(
    "\nERROR:",
    error.message
  );
});
