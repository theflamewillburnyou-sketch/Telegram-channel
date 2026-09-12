function selectCanonicalArticle(cluster) {
  const articles = cluster.articles || [];

  if (articles.length === 0) {
    return null;
  }

  // Prefer the article with the longest content
  // because it usually contains more context.
  const sorted = [...articles].sort(
    (a, b) => {
      const contentA =
        (a.content || "").length;

      const contentB =
        (b.content || "").length;

      return contentB - contentA;
    }
  );

  return sorted[0];
}


function createCanonicalEvent(cluster) {
  const article =
    selectCanonicalArticle(
      cluster
    );

  if (!article) {
    return null;
  }

  return {
    ...article,

    clusterId:
      cluster.clusterId,

    clusterSize:
      cluster.articles.length,

    noveltyScore:
      cluster.noveltyScore,

    noveltyLevel:
      cluster.noveltyLevel,

    relatedArticles:
      cluster.articles.map(
        item => ({
          title: item.title,
          source: item.source,
          link: item.link,
          publishedAt:
            item.publishedAt
        })
      )
  };
}


module.exports = {
  selectCanonicalArticle,
  createCanonicalEvent
};
