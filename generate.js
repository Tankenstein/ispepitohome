const fs = require("fs/promises");
const mustache = require("mustache");
const { getPepitoStatus } = require("./src/pepito");

async function main() {
  console.log("Fetching Pepito status...");
  const pepito = await getPepitoStatus();
  console.log("Creating view model...");
  const viewModel = createViewModel(pepito);
  console.log("Rendering view...");
  const template = await fs.readFile(`${__dirname}/pageTemplate.html`, "UTF-8");
  const view = mustache.render(template, viewModel);
  console.log("Saving view...");
  await fs.writeFile(`${__dirname}/public/index.html`, view, "UTF-8");
  console.log(`Done, ${viewModel.pageTitle}.`);
}

function createViewModel(pepito) {
  const model = {
    time: pepito.updateTime,
    tweetLink: `https://twitter.com/PepitoTheCat/status/${pepito.tweetId}`,
    metaTitle: "Is pepito home?",
    metaDescription: "Find out if Pepito the cat is home or not",
  };
  if (pepito.isHome) {
    model.pageTitle = "Pepito is home";
    model.contentTitle = "Yes";
  } else {
    model.pageTitle = "Pepito is out";
    model.contentTitle = "No";
  }
  return model;
}

main();
