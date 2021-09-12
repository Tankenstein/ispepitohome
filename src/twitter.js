const http = require("axios");

const twitter = http.create({
  baseURL: "https://api.twitter.com",
  headers: {
    Authorization: `Bearer ${getTwitterBearerToken()}`,
  },
});

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

module.exports = { getTwitterUser, getLatestTweets };
