// Change this to your deployed web app URL after you deploy (e.g. https://img2prompt.netlify.app)
const APP_URL = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "img2prompt",
    title: "Generate AI prompt from image",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "img2prompt" && info.srcUrl) {
    const target = `${APP_URL}/?img=${encodeURIComponent(info.srcUrl)}`;
    chrome.tabs.create({ url: target });
  }
});
