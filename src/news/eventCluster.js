function normalizeWords(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3);
}


function calculateSimilarity(title1, title2) {
  const words1 =
    new Set(normalizeWords(title1));

  const words2 =
    new Set(normalizeWords(title2));

  let common = 0;

  for (const word of words1) {
    if (words2.has(word)) {
      common++;
    }
  }

  const total =
    new Set([
      ...words1,
      ...words2
    ]).size;

  if (total === 0) {
    return 0;
  }

  return common / total;
}


function clusterArticles(
  articles,
  threshold = 0.35
) {
  const clusters = [];

  for (const article of articles) {
    let matchedCluster = null;

    for (const cluster of clusters) {
      const similarity =
        calculateSimilarity(
          article.title,
          cluster.articles[0].title
        );

      if (similarity >= threshold) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {

      matchedCluster.articles.push(
        article
      );

    } else {

      clusters.push({
        clusterId:
          `cluster_${clusters.length + 1}`,

        articles: [
          article
        ]
      });
    }
  }

  return clusters;
}


module.exports = {
  normalizeWords,
  calculateSimilarity,
  clusterArticles
};
