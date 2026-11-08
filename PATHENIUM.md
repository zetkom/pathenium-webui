# Pathenium WebUI development

Pathenium is an independent administrative File Explorer and ACL Inspector for TrueNAS.

## Initial implementation

- Angular standalone component at `src/app/pages/pathenium/pathenium.component.ts`
- Authenticated route: `/pathenium` in `src/app/admin.routes.ts`
- Read-only placeholder; no filesystem API calls or mutations yet

## Important compatibility note

The fork's branch was created from the repository's current `master`, whose HEAD commit mentions TrueNAS **28.0.0-BETA.1**. This is **not yet verified** as compatible with the dedicated TrueNAS SCALE **25.10.8** lab.

Before middleware integration, identify the exact upstream release/commit for 25.10.8 and establish a compatible development baseline. Do not deploy this fork over the appliance's built-in UI.

## Planned work

1. Add native navigation entry using the upstream menu registration pattern.
2. Connect dataset listing and ACL read operations through supported middleware methods.
3. Validate read-only access and API compatibility against the lab.
4. Implement safe ACL repair only after backup, preview, and rollback are tested.

Pathenium is not dependent on GargoTN.
