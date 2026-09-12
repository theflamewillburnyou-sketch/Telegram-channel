const { getMarketPrice } = require("./prices");

async function test() {
  try {
    console.log("\n========== BRENT ==========\n");

    const brent = await getMarketPrice("BRENT");

    console.log(brent);


    console.log("\n========== WTI ==========\n");

    const wti = await getMarketPrice("WTI");

    console.log(wti);

  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

test();
