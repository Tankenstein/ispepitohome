const http = require("axios");
const { getPepitoStatus } = require("./src/pepito");

const github = http.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `token ${getGithubToken()}`,
  },
});

async function main() {
  const [pepitoStatus, siteStatus] = await Promise.all([
    getPepitoStatus(),
    getCurrentSiteStatus(),
  ]);
  if (
    pepitoStatus.isHome !== siteStatus.isHome ||
    pepitoStatus.updateTime !== siteStatus.updateTime
  ) {
    log("Site is out of date, updating...");
    await updateSite();
  } else {
    log("Site is up to date");
  }
}

async function getCurrentSiteStatus() {
  const response = await http.get("https://ispepitohome.com");
  const text = response.data;
  const isHome = text.toLowerCase().includes("<h1>yes</h1>");
  const updateTime = parseUpdateTime(text);
  return {
    isHome,
    updateTime,
  };
}

function parseUpdateTime(html) {
  const updateMatches = html.match(/(\d{2}:\d{2}:\d{2})/gi);
  if (updateMatches && updateMatches.length) {
    return updateMatches[0];
  }
  return null;
}

async function updateSite() {
  await github.post(
    `/repos/tankenstein/ispepitohome/actions/workflows/build.yaml/dispatches`,
    {
      ref: "main",
    },
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );
}

function getGithubToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is missing. Provide it."
    );
  }
  return token;
}

function log(message) {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${message}`);
}

main();
setInterval(main, 1000 * 60); // check every minute
