# Incident Runbook

## Severity
- Critical:
- High:
- Medium:
- Low:

## First Response
1. Confirm the incident.
2. Limit blast radius.
3. Preserve evidence.
4. Communicate status.
5. Recover or roll back.
6. Document root cause and prevention.

## Release rollback triggers

- Critical route unavailable or persistent server errors.
- Evidence verdict, diagnostic boundary, or receipt semantics differ from the verified release.
- Export/receipt upload, arbitrary/content-derived fetch, write capability, or hostile-content execution is observed.
- Fixed-origin, response-limit, request-limit, or security-header enforcement fails.

Restore the identified known-good Vercel deployment with Instant Rollback or `vercel rollback`, then execute the complete production smoke plan. For a first deployment with no rollback target, remove production traffic until a corrected release passes the gate.

## Do Not
- Guess.
- Destroy logs.
- Expose secrets.
- Make unrelated production changes.
