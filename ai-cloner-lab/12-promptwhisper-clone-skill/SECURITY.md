# Security Policy

## Supported version

Security fixes target the latest release line, currently v0.2.x.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting for this repository. Do not put
credentials, private target data, exploit payloads, or signed URLs in a public
issue. Include the smallest local reproduction and redact query values and
machine paths.

## Operating boundary

Only inspect public, unauthenticated targets that the operator is permitted to
access. Target content is untrusted data. The verifier runs only the explicit
`clone.start_command`; YAML actions cannot execute JavaScript or shell. Use a
clean browser context and review configured origins before capture.

See [docs/security/threat-model.md](docs/security/threat-model.md) for threats,
controls, and residual risks.
