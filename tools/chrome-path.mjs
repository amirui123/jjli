/** Prints the Chromium executable path (extracting it on first call). */
import { getBrowser } from "./lib/browser.mjs";
const b = await getBrowser();
process.stdout.write(b.executablePath);
