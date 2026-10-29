// Freeze the clock-dependent UI (marquees, shimmers, aurora blobs) before shooting.
module.exports = async (page) => {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if (s.animationName && s.animationName !== "none") el.style.animationPlayState = "paused";
    }
    document.documentElement.style.setProperty("--marquee-duration", "100000s");
  });
  await new Promise((r) => setTimeout(r, 700));
};
