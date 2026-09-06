# Backup and Recovery

This release stores no database, uploaded files, user state, credentials, or application secrets. Data backup, RPO, and data-restore procedures are not applicable.

Recovery is deployment rollback:

1. Identify the last known-good production deployment before promotion.
2. If release criteria fail, use Vercel Instant Rollback or `vercel rollback` to restore it.
3. For a first deployment with no prior target, remove production traffic until a corrected build is verified.
4. Re-run the complete production smoke plan and record the result.

Rollback eligibility depends on the selected Vercel plan; confirm it when the project/team is selected. No rollback has been executed or tested because no deployment exists.
