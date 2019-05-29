exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  console.log("THIS CODE WORKS");
  if (stage === "build-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /pixi.js/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
