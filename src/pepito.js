const { getTwitterUser, getLatestTweets } = require("./twitter");

async function getPepitoStatus() {
  const pepito = await getTwitterUser("PepitoTheCat");
  if (!pepito) {
    throw new Error("Did not find Pepito's user");
  }
  const latestTweets = await getLatestTweets(pepito.id);
  if (!latestTweets || !latestTweets.length) {
    throw new Error("Could not fetch latest pepito tweets");
  }

  const statusTweet = findLatestStatusTweet(latestTweets);
  if (!statusTweet) {
    throw new Error("Did not find any valid status tweet");
  }

  const updateTime = getUpdateTime(statusTweet);
  if (!updateTime) {
    throw new Error("Was not able to parse the update time");
  }

  return {
    isHome: isBackHomeTweet(statusTweet),
    updateTime,
    tweetId: statusTweet.id,
  };
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
    return null;
    throw new Error("Did not find time in pepito status tweet");
  }
  const parentheses = matches[0];
  return parentheses.slice(1, parentheses.length - 1);
}

module.exports = { getPepitoStatus };
