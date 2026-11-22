import fs from "node:fs";

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node scripts/report-npm-audit.mjs <npm-audit-json>");
  process.exitCode = 2;
} else {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const metadata = report.metadata?.vulnerabilities ?? {};
  const vulnerabilities = Object.entries(report.vulnerabilities ?? {})
    .map(([name, item]) => ({
      name,
      severity: item.severity,
      direct: item.isDirect,
      range: item.range,
      fixAvailable: item.fixAvailable,
      advisories: (item.via ?? [])
        .filter((entry) => typeof entry === "object")
        .map((entry) => ({
          title: entry.title,
          url: entry.url,
          range: entry.range,
        })),
    }))
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };
      return (rank[a.severity] ?? 5) - (rank[b.severity] ?? 5) || a.name.localeCompare(b.name);
    });

  console.log("Full dependency-tree npm audit summary:");
  console.log(JSON.stringify({ totals: metadata, packages: vulnerabilities }, null, 2));
}
