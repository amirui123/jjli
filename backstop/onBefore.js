// Keep the intro film out of visual diffs; it is animated and would flake every run.
module.exports = async (page) => {
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) jsdom Chromium/153 Safari/537.36"
  );
  await page.setCacheEnabled(false);
};
