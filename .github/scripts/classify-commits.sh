#!/usr/bin/env bash
#
# Classify release commits into categories for CHANGELOG entries and PR bodies.
#
# Reads annotated commit lines on stdin, one per line, in the format produced by
# the "Annotate commits with author + external flag" workflow step:
#
#   <short-sha> <subject> -- author=<github-login> external=<true|false>
#
# Writes TSV to stdout, one line per included commit:
#
#   <category>\t<description>\t<pr-ref>\t<login>\t<external>
#
# where <category> is one of: breaking, feature, fix, improvement, enhancement
# and <pr-ref> is either "#NNN" or empty.
#
# Chore-type commits (chore/ci/docs/test/build/style, version-bump and
# release-automation commits) are dropped entirely.
#
# Classification order:
#   1. Conventional-commit prefix (feat:, fix:, perf:, ...). A "!" before the
#      colon, or a "BREAKING CHANGE" marker, promotes the commit to breaking.
#   2. Leading imperative verb, for the many historical commits in these repos
#      that predate conventional commits.
#   3. Anything left over becomes "enhancement".

set -euo pipefail

# Subjects matching these patterns are release-automation noise, never user-facing.
readonly SKIP_SUBJECT_RE='^(Prepare for |Bump versions|Update changelogs|Applying documentation updates|Merge (branch|pull request|remote-tracking)|Release/|Run rush change|Initial (commit|release)|Resync )'

# Conventional-commit types that never appear in release notes.
readonly SKIP_TYPE_RE='^(chore|ci|docs|test|tests|build|style|revert)$'

# Bare-subject chore detection, for the many commits predating conventional
# commits. Deliberately narrow: it requires a chore *object* (CI, README, API
# docs, the test suite, a linter) so that user-facing changes which merely
# mention a version or a dependency are still included. Verified against the
# existing hand-written CHANGELOGs, which omit exactly these.
readonly SKIP_BARE_RE='(^|[[:space:]])(ci|CI)([[:space:]]|$)|[Ll]inting|[Ll]int issues|(unit|integration|flaky)[[:space:]]+tests?|tests?[[:space:]]+(in|on)[[:space:]]+CI|README|API docs|api docs|[Dd]ocumentation (build|updates|page)|docs\.snowplow\.io|API ref|[Cc]hangelog|GitHub [Aa]ction|publish action|prepare-release|\[skip ci\]|[Cc]laude|CLAUDE\.md|[Aa]gent pipeline|instrumentation|jest tests|[Ss]igning config for demo|[Bb]undlemon|[Cc]overalls|[Dd]ependabot|[Aa]ddress (PR )?review|[Aa]ddress review comments|[Ff]ix(up)? review|[Aa]pply review|[Ss]elf-review|[Rr]ebase|[Mm]erge conflict|[Tt]ypo in (test|CI)'

while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Split the trailing "-- author=... external=..." metadata off the subject.
  # The separator is optional: dry runs and manual testing pipe bare
  # "<sha> <subject>" lines, and treating those as metadata would leak the
  # parsed fields into the description.
  if [[ "$line" == *" -- author="* ]]; then
    meta="${line##*" -- "}"
    head="${line%" -- "*}"
  else
    meta=""
    head="$line"
  fi

  # The leading short sha is dropped; only the subject drives classification.
  subject="${head#* }"
  [[ "$subject" == "$head" ]] && subject=""
  [[ -z "$subject" ]] && continue

  login=""
  external="false"
  if [[ -n "$meta" ]]; then
    if [[ "$meta" =~ author=([^[:space:]]*) ]]; then
      login="${BASH_REMATCH[1]}"
    fi
    if [[ "$meta" =~ external=([^[:space:]]*) ]]; then
      external="${BASH_REMATCH[1]}"
    fi
  fi

  # Drop release-automation commits.
  if [[ "$subject" =~ $SKIP_SUBJECT_RE ]]; then
    continue
  fi

  breaking="false"
  # "BREAKING CHANGE" / "BREAKING-CHANGE" anywhere in the subject is a strong signal.
  if [[ "$subject" == *"BREAKING CHANGE"* || "$subject" == *"BREAKING-CHANGE"* ]]; then
    breaking="true"
  fi

  category=""
  description="$subject"

  # --- Rule 1: conventional-commit prefix ---------------------------------
  # Matches "type: ", "type(scope): ", and the breaking "type!: " / "type(scope)!: ".
  if [[ "$subject" =~ ^([a-zA-Z]+)(\(([^\)]*)\))?(!)?:[[:space:]]+(.*)$ ]]; then
    type="$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')"
    bang="${BASH_REMATCH[4]}"
    rest="${BASH_REMATCH[5]}"

    if [[ "$type" =~ $SKIP_TYPE_RE ]]; then
      continue
    fi

    [[ -n "$bang" ]] && breaking="true"

    case "$type" in
      feat|feature) category="feature" ;;
      fix|bugfix)   category="fix" ;;
      perf|refactor) category="improvement" ;;
      *)            category="" ;;  # unknown type: fall through to the verb rule
    esac

    if [[ -n "$category" ]]; then
      # Drop the scope. It duplicates information already obvious from the
      # description in these repos (e.g. "emitter: wake emitter on signal"),
      # and keeping it forces an awkward capitalisation of the scope token.
      description="$rest"
    fi
  fi

  # --- Rule 2: leading imperative verb -----------------------------------
  # Covers the bare-subject style used throughout these repos' history.
  if [[ -z "$category" ]]; then
    # Bare chore commits (CI, docs, lint, test-suite upkeep) are not
    # user-facing. Only applied here: an explicit "feat:"/"fix:" prefix in
    # rule 1 always wins, so a genuine fix mentioning CI is never dropped.
    if [[ "$subject" =~ $SKIP_BARE_RE ]]; then
      continue
    fi

    verb="$(printf '%s' "$subject" | awk '{print tolower($1)}')"
    case "$verb" in
      fix|fixes|fixed|resolve|resolves|correct|corrects|prevent|prevents|address|addresses|avoid|avoids|handle|handles|guard)
        category="fix" ;;
      add|adds|added|introduce|introduces|support|supports|expose|exposes|implement|implements|allow|allows|enable|enables|create|creates)
        category="feature" ;;
      improve|improves|update|updates|upgrade|upgrades|refactor|refactors|change|changes|make|makes|migrate|migrates|remove|removes|strip|strips|filter|filters|rename|renames|switch|switches|reduce|reduces|optimise|optimize|simplify|declare|deprecate|deprecates|move|moves|replace|replaces|drop|drops|adjust|adjusts|annotate|clean|unify|tidy|undeprecate|reintroduce)
        category="improvement" ;;
      *)
        category="enhancement" ;;
    esac
  fi

  [[ "$breaking" == "true" ]] && category="breaking"

  # Extract a PR/issue reference to preserve at the end of the line.
  #
  # Subjects may carry two references: a trailing "(#NNN)" squash-merge marker
  # added by GitHub, and an inline "(close #NNN)" issue link written by the
  # author. Prefer the inline issue reference (it names the user-visible issue)
  # and strip both markers so the formatters re-append exactly one.
  pr_ref=""
  if [[ "$description" =~ \((close[sd]?|fix(e[sd])?|resolve[sd]?)[[:space:]]+\#([0-9]+)\) ]]; then
    # Preserve the "close" keyword: the existing CHANGELOGs write "(close #720)",
    # and it keeps GitHub's issue-closing semantics visible in the notes.
    pr_ref="${BASH_REMATCH[1]} #${BASH_REMATCH[3]}"
    description="$(printf '%s' "$description" \
      | sed -E 's/[[:space:]]*\((close[sd]?|fix(e[sd])?|resolve[sd]?)[[:space:]]+#[0-9]+\)//I')"
    # Drop a redundant trailing squash marker, e.g. "... (close #720) (#720)".
    description="$(printf '%s' "$description" | sed -E 's/[[:space:]]*\(#[0-9]+\)[[:space:]]*$//')"
  elif [[ "$description" =~ \(\#([0-9]+)\)[[:space:]]*$ ]]; then
    pr_ref="#${BASH_REMATCH[1]}"
    description="$(printf '%s' "$description" | sed -E 's/[[:space:]]*\(#[0-9]+\)[[:space:]]*$//')"
  elif [[ "$description" =~ \#([0-9]+) ]]; then
    pr_ref="#${BASH_REMATCH[1]}"
  fi

  # Strip an inline BREAKING CHANGE marker; the category already conveys it.
  description="$(printf '%s' "$description" \
    | sed -E 's/^BREAKING[ -]CHANGE:?[[:space:]]*//; s/[[:space:]]*BREAKING[ -]CHANGE:?[[:space:]]*/ /')"

  # Tidy whitespace and drop a trailing period for consistent list formatting.
  description="$(printf '%s' "$description" | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//; s/\.$//')"
  [[ -z "$description" ]] && continue

  # Capitalise the first letter so bare conventional-commit bodies read as list items.
  first="$(printf '%s' "${description:0:1}" | tr '[:lower:]' '[:upper:]')"
  description="${first}${description:1}"

  # Empty fields are written as "-": bash's word splitting collapses runs of
  # tabs, so a genuinely empty column would shift every later field left.
  # The formatters translate "-" back to an empty string.
  printf '%s\t%s\t%s\t%s\t%s\n' \
    "$category" "$description" "${pr_ref:--}" "${login:--}" "$external"
done
