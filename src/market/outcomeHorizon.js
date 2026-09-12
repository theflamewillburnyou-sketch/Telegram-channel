const OUTCOME_HORIZONS = {
  ONE_HOUR: {
    name: "1H",
    milliseconds: 60 * 60 * 1000
  },

  ONE_DAY: {
    name: "1D",
    milliseconds: 24 * 60 * 60 * 1000
  },

  ONE_WEEK: {
    name: "1W",
    milliseconds: 7 * 24 * 60 * 60 * 1000
  }
};

function getTargetTime(eventTimestamp, horizon) {
  const target =
    new Date(eventTimestamp).getTime() +
    horizon.milliseconds;

  return new Date(target).toISOString();
}

module.exports = {
  OUTCOME_HORIZONS,
  getTargetTime
};
