# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and
Semantic Versioning.

## [0.2.0] - 2026-08-30

### Added

- Strict YAML configuration and JSON Schema with declarative state actions.
- Playwright Chromium capture for matched target and clone states.
- Console, page, HTTP, request-failure, and original-origin runtime audits.
- Deterministic screenshot comparison orchestration and portable HTML reports.
- Target self-variance calibration helper.
- Local responsive and malicious-content fixtures, automated tests, and CI.
- English and Simplified Chinese usage and security documentation.

### Changed

- Verification now requires machine-readable evidence and truthful status/exit
  codes instead of subjective completion claims.

### Security

- Target website content is explicitly treated as untrusted data.
- Query values are redacted from runtime audit URLs and report output.

[0.2.0]: https://github.com/promptwhisper/clone-any-website-skill/releases/tag/v0.2.0
