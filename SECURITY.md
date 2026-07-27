# Security policy

## Supported versions

Security fixes target the latest stable release and the default development
branch. Older lines may receive fixes only when a maintainer announces them.

## Report a vulnerability privately

Do not open a public issue for a vulnerability or attach a real malicious vault,
schema, Bundle, credential, or restricted CTI.

Use the repository **Security** tab and select **Report a vulnerability** to
open a private security advisory. Include:

- the affected version and platform;
- the smallest sanitized reproduction;
- the expected and observed security boundary;
- impact and any known workaround.

If private vulnerability reporting is unavailable, contact `rx4747` privately
before sharing details.

## Security boundaries

Treat Markdown, YAML frontmatter, Canvas JSON, plugin settings, local extension
schemas, paths, and imported JSON as untrusted. The plugin is local-first: it
must not transmit vault content, fetch remote schemas, add telemetry, or perform
network export by default.

Never submit real malware binaries or exploit payloads as a reproduction.
