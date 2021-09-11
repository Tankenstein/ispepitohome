const http = require("axios");
const fs = require("fs/promises");
const mustache = require("mustache");

const twitter = http.create({
  baseURL: "https://api.twitter.com",
  headers: {
    Authorization: `Bearer ${getTwitterBearerToken()}`,
  },
});

async function main() {
  console.log("Fetching Pepito...");
  const pepito = await getTwitterUser("PepitoTheCat");
  console.log("Getting Pepito's latest tweets...");
  const latestTweets = await getLatestTweets(pepito.id);
  console.log("Creating view model...");
  const statusTweet = findLatestStatusTweet(latestTweets);
  if (!statusTweet) {
    throw new Error("Did not find any valid status tweet");
  }
  const viewModel = createViewModel(statusTweet);
  console.log("Rendering view...");
  const template = await fs.readFile(`${__dirname}/pageTemplate.html`, "UTF-8");
  const view = mustache.render(template, viewModel);
  console.log("Saving view...");
  await fs.writeFile(`${__dirname}/public/index.html`, view, "UTF-8");
  console.log(`Done, ${viewModel.pageTitle}.`);
}

function createViewModel(tweet) {
  const model = {
    time: getUpdateTime(tweet),
    tweetLink: `https://twitter.com/PepitoTheCat/status/${tweet.id}`,
    metaTitle: "Is pepito home?",
    metaDescription: "Find out if Pepito the cat is home or not",
  };
  if (isGoneTweet(tweet)) {
    model.pageTitle = "Pepito is out";
    model.contentTitle = "No";
  } else {
    model.pageTitle = "Pepito is home";
    model.contentTitle = "Yes";
  }
  return model;
}

function findLatestStatusTweet(tweets) {
  for (const tweet of tweets) {
    if (isGoneTweet(tweet) || isBackHomeTweet(tweet)) {
      return tweet;
    }
  }
}

function isGoneTweet(tweet) {
  return tweet.text.toLowerCase().includes("is out");
}

function isBackHomeTweet(tweet) {
  return tweet.text.toLowerCase().includes("back home");
}

function getUpdateTime(tweet) {
  const matches = tweet.text.match(/\(.*\)/gi);
  if (!matches || !matches.length) {
    throw new Error("Did not find time in pepito status tweet");
  }
  const parentheses = matches[0];
  return parentheses.slice(1, parentheses.length - 1);
}

// returns user ({ id: '333923305', name: 'Pépito', username: 'PepitoTheCat' }) or null
async function getTwitterUser(username) {
  const response = await twitter.get("/2/users/by", {
    params: {
      usernames: username,
    },
  });
  return response.data.data[0];
}

// returns tweets ({ id, created_at, text })
async function getLatestTweets(userId) {
  const response = await twitter.get(
    `https://api.twitter.com/2/users/${userId}/tweets`,
    {
      max_results: 10,
      "tweet.fields": "created_at",
    }
  );
  return response.data.data;
}

function getTwitterBearerToken() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    throw new Error(
      "TWITTER_BEARER_TOKEN environment variable is missing. Provide it."
    );
  }
  return token;
}

main();
