# Preparing a release

The `Prepare release PR` workflow (`.github/workflows/prepare-release.yml`)
automates the "Prepare for X.Y.Z release" commit and the release PR that
maintainers used to write by hand.

Note: the JS tracker is a Rush monorepo. Per-package version bumps and per-
package `CHANGELOG.md` entries are produced by `rush version --bump` and
`rush publish --apply` during `publish.yml`, **not** by the prepare-release
workflow. The prepare-release step only sets the `nextBump` field in
`common/config/rush/version-policies.json` so Rush bumps to the right target
on publish.

## How a release works now

1. Create the release branch from `master` and merge feature/bug-fix PRs into
   it as usual:
   ```bash
   git checkout master && git pull
   git checkout -b release/4.9.0
   git push -u origin release/4.9.0
   ```
2. When the branch is ready to ship, go to **Actions → Prepare release PR →
   Run workflow** and fill in:
   - `release_branch`: `release/4.9.0`
   - `dry_run`: leave unchecked for a real run; check it for a preview.
3. The workflow computes the correct `nextBump` (`patch` / `minor` / `major`)
   from the current version in `version-policies.json` vs the target version
   parsed from the branch name, then updates the single line in
   `common/config/rush/version-policies.json`.
4. Commits as `Prepare for X.Y.Z release` and pushes to the release branch.
5. Asks Claude to draft the PR body from the commits on the branch (using the
   previous release PR as a style example) — flat bullets for 1–2 changes,
   `**New features** / **Enhancements** / **Bug fixes**` groups for 3+, with
   `thanks to @user` attribution for external contributors only.
6. Opens (or updates) a PR titled `Release/X.Y.Z` against `master`.

Review the PR, edit the PR body in place if needed, then merge. After
merging, run **Actions → Deploy Tracker** with the version string as the
input. `publish.yml` runs `rush version --bump` (which performs the actual
per-package version bumps and generates the per-package CHANGELOGs from the
`rush change` files under `common/changes/`), cross-validates the resulting
tracker version against your input, builds, tests, publishes to npm, tags
`X.Y.Z`, and creates the GitHub release with `sp.js` / `sp.lite.js` and the
plugins zip attached.

## Re-running on the same branch

If you push a small fix to the release branch after the workflow ran, re-run
the workflow. It detects that `HEAD` is already a `Prepare for X.Y.Z release`
commit and skips the bump+commit — it only refreshes the PR body.

If you need the bump re-done from scratch, drop the prepare commit locally
(`git reset --hard HEAD~1 && git push --force-with-lease`) and re-run the
workflow.

## Dry-run mode

`dry_run: true` runs everything up to (but not including) the push and the PR
write. The full `git diff` and the generated PR body are printed to the
workflow log. Use this the first time you exercise the workflow on a real
release branch.

## Inputs that will make the workflow fail loudly

- A `release_branch` that doesn't match `release/X.Y.Z`.
- A `release_branch` that doesn't exist on origin.
- A target version that isn't a valid next semver bump from the current
  version in `version-policies.json` (e.g. you're on `4.8.1` and you ask
  for `5.1.0`; the script only accepts the next patch, the next minor, or
  the next major).
- A previous release tag that can't be found on `master` (the workflow needs
  one to compute the commit list).

## Notes on the commit filter

`commits-raw.txt` is built by filtering out commits the JS publish pipeline
creates automatically, so they don't end up in the release notes:

- `Prepare for ...`
- `Bump versions [skip ci]` (from `rush version --bump`)
- `Update changelogs [skip ci]` (from `rush publish --apply`)
- `Applying documentation updates.` (api-docs commit during publish)

If the publish pipeline ever changes its commit subjects, update the
`grep -v -E` line in `prepare-release.yml` to match.

## Requirements

- `ANTHROPIC_API_KEY` secret must be set on the repository.
- `GITHUB_TOKEN` (provided automatically) needs `contents: write` and
  `pull-requests: write`, which the workflow declares.
