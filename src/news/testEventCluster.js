const {
  clusterArticles
} = require("./eventCluster");


const articles = [
  {
    title:
      "Iran launches missiles at Israel"
  },

  {
    title:
      "Iran missile attack sends oil prices higher"
  },

  {
    title:
      "Oil rises after Iran attack"
  },

  {
    title:
      "Apple reports strong quarterly earnings"
  },

  {
    title:
      "Bitcoin rises after ETF inflows"
  }
];


const clusters =
  clusterArticles(
    articles
  );


console.log(
  "\n========== EVENT CLUSTERS ==========\n"
);


clusters.forEach(
  (cluster, index) => {

    console.log(
      `Cluster ${index + 1} (${cluster.clusterId}):`
    );

    for (const article of cluster.articles) {
      console.log(
        " -",
        article.title
      );
    }

    console.log();
  }
);
