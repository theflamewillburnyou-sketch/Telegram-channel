const {
  createExpectedVsActual
} = require("./expectedVsActual");

const tests = [
  {
    symbol: "BTC",
    percentageChange: 2.4,
    expected: "BULLISH"
  },

  {
    symbol: "ETH",
    percentageChange: -1.8,
    expected: "BULLISH"
  },

  {
    symbol: "BTC",
    percentageChange: 0.08,
    expected: "BULLISH"
  },

  {
    symbol: "ETH",
    percentageChange: -2.1,
    expected: "BEARISH"
  }
];

console.log(
  "\n========== EXPECTED VS ACTUAL ==========\n"
);

for (const test of tests) {
  const outcome = {
    symbol: test.symbol,
    percentageChange:
      test.percentageChange
  };

  const result =
    createExpectedVsActual(
      test.expected,
      outcome
    );

  console.dir(result, {
    depth: null
  });
}
