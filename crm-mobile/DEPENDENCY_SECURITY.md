# Dependency security status

Checked on 2026-08-03.

- A safe `npm audit fix` was applied within the Expo SDK 54 dependency ranges.
- No critical vulnerability remains in the installed mobile dependency tree.
- The remaining high-severity report is inherited through the Expo SDK 54 Metro/PostCSS toolchain. npm only offers a forced upgrade to Expo SDK 57, which is a breaking framework migration and conflicts with this project's SDK 54 constraint.
- Twenty-two moderate reports are also transitive Expo configuration/xcode dependencies in the installed development tree; npm likewise requires the same breaking SDK upgrade to remove them.
- Backend production dependencies report zero known vulnerabilities with `npm audit --omit=dev`.

Do not run `npm audit fix --force` in this branch. Plan and test the Expo SDK upgrade as a separate change, following the versioned Expo migration documentation.
