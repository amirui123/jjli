# Contributing

Use Node.js 20+ and Python 3. Install dependencies with:

```bash
npm install
python3 -m pip install -r requirements.txt
npx playwright install chromium
```

Run `npm run check` before opening a pull request. Tests must remain independent
of public websites and generate screenshots in temporary or ignored output
directories. New configuration fields require a strict Schema update, a parser
test, documentation, and a safe default. Do not add arbitrary JavaScript or
general command actions to YAML.

Keep changes focused. Preserve relative paths inside the distributable
`clone-any-website/` directory and compatibility with
`scripts/compare-screenshots.py`. Never commit credentials, signed URLs,
browser profiles, captured user content, proprietary bundles, or unlicensed
assets.
