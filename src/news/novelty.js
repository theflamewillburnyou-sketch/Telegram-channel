function calculateNovelty(
  clusterSize
) {
  if (clusterSize === 1) {
    return 100;
  }

  if (clusterSize === 2) {
    return 80;
  }

  if (clusterSize <= 4) {
    return 60;
  }

  if (clusterSize <= 7) {
    return 40;
  }

  return 20;
}


function getNoveltyLevel(
  noveltyScore
) {
  if (noveltyScore >= 80) {
    return "HIGH";
  }

  if (noveltyScore >= 50) {
    return "MEDIUM";
  }

  return "LOW";
}


function addNovelty(
  clusters
) {
  return clusters.map(
    cluster => {

      const noveltyScore =
        calculateNovelty(
          cluster.articles.length
        );

      return {
        ...cluster,

        noveltyScore,

        noveltyLevel:
          getNoveltyLevel(
            noveltyScore
          )
      };
    }
  );
}


module.exports = {
  calculateNovelty,
  getNoveltyLevel,
  addNovelty
};
