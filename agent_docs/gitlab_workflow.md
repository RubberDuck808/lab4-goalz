# GitLab Issue Workflow

Work is tracked on the GitLab issue board. Always check the board before starting a task, and reference issues in every related commit.

## Checking the Board

```bash
# List all open issues
glab issue list

# Filter to in-progress issues (label "Doing")
glab issue list --label "Doing"

# View detail for a specific issue
glab issue view <id>
```

## Referencing Issues in Commits

Include the issue reference in the commit message body:

```
short summary of what was done

Closes #<id>     ← use this to auto-close the issue when merged to the default branch
Refs #<id>       ← use this to link without closing (e.g. partial work, mid-feature commit)
```

Example:
```
add party CRUD endpoints

Closes #30
```

Multiple issues can be referenced on separate lines.

## Workflow

1. Before starting any task: run `glab issue list` to see open issues and pick the relevant one.
2. Note the issue ID — include it in every commit that contributes to that issue.
3. Use `Closes #<id>` on the final commit that completes the issue.
4. Use `Refs #<id>` on intermediate commits for the same issue.

## Useful Filters

```bash
# Issues with no label (unplanned/unassigned)
glab issue list --label ""

# Issues by label
glab issue list --label "Dashboard"
glab issue list --label "MobileApp"
glab issue list --label "Todo"
glab issue list --label "Doing"
glab issue list --label "Review"
```
