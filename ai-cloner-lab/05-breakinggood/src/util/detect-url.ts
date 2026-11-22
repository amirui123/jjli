export type Mode = "repo" | "site";

export interface ParsedTarget {
  mode: Mode;
  url: string;
  /** For repos: a clean clone URL. For sites: the normalised page URL. */
  cloneUrl?: string;
  /** Suggested directory name. */
  name: string;
  /** Optional branch/subpath for GitHub tree URLs. */
  branch?: string;
}

const GIT_HOSTS = ["github.com", "gitlab.com", "bitbucket.org", "codeberg.org", "gitea.com"];

export function parseTarget(input: string): ParsedTarget {
  let raw = input.trim();
  if (!/^[a-z]+:\/\//i.test(raw) && !raw.startsWith("git@")) raw = "https://" + raw;

  // git@github.com:owner/repo.git
  const ssh = raw.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (ssh) {
    const [, host, p] = ssh;
    return { mode: "repo", url: raw, cloneUrl: raw, name: p.split("/").pop()!, };
  }

  const u = new URL(raw);
  const host = u.hostname.toLowerCase();

  if (GIT_HOSTS.includes(host) || u.pathname.endsWith(".git")) {
    const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length >= 2) {
      const [owner, repoRaw, kind, branch] = parts;
      const repo = repoRaw.replace(/\.git$/, "");
      const cloneUrl = `${u.protocol}//${host}/${owner}/${repo}.git`;
      return {
        mode: "repo",
        url: raw,
        cloneUrl,
        name: repo,
        branch: kind === "tree" && branch ? branch : undefined,
      };
    }
  }

  const name = host.replace(/^www\./, "").split(".")[0] || "site";
  return { mode: "site", url: u.toString(), name: `${name}-clone` };
}
