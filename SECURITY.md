# Security policy

## Supported versions

Until a newer public release exists, security fixes target the current `0.1.x`
line and the default development branch.

## Report a vulnerability privately

Do not open a public issue for a vulnerability or attach a real malicious vault,
schema, Bundle, credential, or restricted CTI.

After the public GitHub repository is created, use its **Security** tab and
select **Report a vulnerability** to open a private security advisory. Include:

- the affected version and platform;
- the smallest sanitized reproduction;
- the expected and observed security boundary;
- impact and any known workaround.

If private vulnerability reporting is not yet enabled, contact the repository
owner privately before sharing details. The final owner contact will be added
when repository ownership is confirmed.

## Security boundaries

Treat Markdown, YAML frontmatter, Canvas JSON, plugin settings, local extension
schemas, paths, and imported JSON as untrusted. The plugin is local-first: it
must not transmit vault content, fetch remote schemas, add telemetry, or perform
network export by default.

Never submit real malware binaries or exploit payloads as a reproduction.
