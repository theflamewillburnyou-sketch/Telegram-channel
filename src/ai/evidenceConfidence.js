function calculateEvidenceConfidence(article) {

  const content =
    article.content || "";

  let score = 0;


  if (content.length >= 1000) {
    score += 3;
  } else if (content.length >= 300) {
    score += 2;
  } else if (content.length >= 100) {
    score += 1;
  }


  if (
    article.sourceQualityScore >= 5
  ) {
    score += 3;
  } else if (
    article.sourceQualityScore >= 3
  ) {
    score += 2;
  } else {
    score += 1;
  }


  if (
    article.clusterSize >= 3
  ) {
    score += 2;
  } else if (
    article.clusterSize === 2
  ) {
    score += 1;
  }


  if (score >= 7) {
    return "HIGH";
  }

  if (score >= 4) {
    return "MEDIUM";
  }

  return "LOW";
}


function addEvidenceConfidence(articles) {

  return articles.map(article => ({

    ...article,

    evidenceConfidence:
      calculateEvidenceConfidence(
        article
      )

  }));

}


module.exports = {
  calculateEvidenceConfidence,
  addEvidenceConfidence
};
