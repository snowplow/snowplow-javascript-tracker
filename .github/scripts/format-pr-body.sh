#!/usr/bin/env bash
#
# Format classified commits into a release PR body.
#
# Reads the TSV produced by classify-commits.sh on stdin and writes
# GitHub-flavoured markdown to stdout: bullets grouped under bold headers,
# with external contributors credited.
#
# Groups with no entries are omitted. If nothing at all is classifiable the
# script emits a short placeholder rather than an empty body, so the PR is
# never opened with a blank description.

set -euo pipefail

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# Bucket the incoming rows by category.
while IFS=$'\t' read -r category description pr_ref login external; do
  [[ -z "${category:-}" ]] && continue
  # classify-commits.sh writes "-" for empty columns; see the note there.
  [[ "$pr_ref" == "-" ]] && pr_ref=""
  [[ "$login" == "-" ]] && login=""

  line="- ${description}"
  [[ -n "$pr_ref" ]] && line="${line} (${pr_ref})"
  # Credit external contributors only; team members are not called out.
  if [[ "$external" == "true" && -n "$login" ]]; then
    line="${line} thanks to @${login}"
  fi
  printf '%s\n' "$line" >> "$work/$category"
done

emit_group() {
  local file="$1" header="$2"
  [[ -s "$work/$file" ]] || return 0
  printf '%s\n' "$header"
  cat "$work/$file"
  printf '\n'
}

{
  emit_group breaking    '**Breaking changes:**'
  emit_group feature     '**New features:**'
  emit_group improvement '**Improvements:**'
  emit_group fix         '**Bug fixes:**'
  emit_group enhancement '**Enhancements:**'
} > "$work/body.md"

if [[ -s "$work/body.md" ]]; then
  # Trim the trailing blank line left by the last group.
  awk 'NF || NR < prev_nonblank' prev_nonblank="$(awk 'NF{n=NR}END{print n}' "$work/body.md")" "$work/body.md"
else
  printf '%s\n' 'No user-facing changes in this release.'
fi
