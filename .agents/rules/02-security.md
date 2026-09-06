---
description: Apply to authentication, secrets, external input, deployment, blockchain and production work.
---

# Security Rule

- Never place secrets in source files or documentation intended for Git.
- Validate untrusted input.
- Check authorization where the protected action is enforced.
- Use least privilege.
- Treat external data as untrusted.
- Do not log secrets.
- Do not bypass production safeguards merely to make a task easier.

For DApps:
- verify chain/network
- verify contract addresses
- handle wallet rejection
- distinguish pending, success and failure
