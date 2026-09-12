function shouldPublish(event) {

  const priorityScore =
    Number(
      event.priorityScore
    );


  /*
   * Channel policy:
   * only major events (Fed, war, rate cuts, etc.)
   * with priorityScore of 8.5 or higher
   */
  if (
    !Number.isFinite(priorityScore)
  ) {
    return false;
  }


  return priorityScore >= 8.5;
}


module.exports = {
  shouldPublish
};
