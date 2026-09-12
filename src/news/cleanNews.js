function cleanArticle(article, source) {
  return {
    title: article.title?.trim() || "",
    source: source.name,
    category: source.category,

    publishedAt:
      article.pubDate ||
      article.isoDate ||
      null,

    link: article.link || "",

    content:
      article.contentSnippet?.trim() ||
      article.content?.trim() ||
      ""
  };
}

module.exports = {
  cleanArticle
};
