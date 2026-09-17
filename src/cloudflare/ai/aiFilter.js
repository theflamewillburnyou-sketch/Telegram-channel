export function shouldUseAI(article) {
  if (article.priorityScore >= 7) {
    return true;
  }

  if (article.priorityLevel === "CRITICAL") {
    return true;
  }

  return false;
}
