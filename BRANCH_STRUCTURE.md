# GitHub Pages Branch Structure

## Overview

The documentation for OMED has been organized into a dedicated `gh-pages` branch following GitHub Pages best practices.

## Branch Structure

### gh-pages Branch (Documentation Only)
```
gh-pages/
├── README.md                    # Branch documentation
└── docs/                        # Documentation website
    ├── index.html              # Homepage
    ├── architecture.html       # System architecture
    ├── supabase-setup.html    # Backend setup
    ├── user-guide.html        # User manual
    ├── migration-guide.html   # Migration guide
    ├── api-reference.html     # API documentation
    ├── capacitor-setup.html   # Mobile deployment
    ├── deployment.html        # Deployment guide
    ├── contributing.html      # Contributing guidelines
    ├── CI_SECRETS.md          # Existing doc
    ├── README.md              # Docs maintenance guide
    └── assets/
        ├── style.css          # Main stylesheet
        ├── doc-page.css       # Doc-specific styles
        ├── script.js          # Interactive features
        └── favicon.svg        # Site icon
```

**Characteristics:**
- Orphan branch (no parent commits)
- Contains ONLY documentation files
- Independent from main codebase
- 16 files total (15 in docs/ + 1 README)

### Main/Working Branches (Code Only)
```
copilot/create-github-pages-documentation/
├── src/                        # Application code
├── android/                    # Android app
├── ios/                        # iOS app
├── build/                      # Build output
├── scripts/                    # Build scripts
├── supabase/                   # Database schemas
├── tools/                      # Development tools
└── [NO docs/ directory]        # Clean!
```

**Characteristics:**
- Contains application code
- No documentation clutter
- Focused on development
- Documentation removed in commit 7ffa490

## Why This Structure?

### Benefits
1. **Separation of Concerns**: Code and docs are independent
2. **Clean Repository**: No documentation files mixed with code
3. **GitHub Pages Standard**: Follows GitHub's recommended approach
4. **Independent Versioning**: Docs can be updated without code changes
5. **Smaller Clones**: Developers don't download docs when cloning for development

### GitHub Pages Configuration

To enable the documentation site:

1. Go to repository **Settings** → **Pages**
2. Configure source:
   - **Branch**: `gh-pages`
   - **Folder**: `/docs`
3. Click **Save**
4. Site will be live at: `https://omed-school.github.io/Omedfrontendfigma/`

## Updating Documentation

### To update docs:
```bash
# Switch to gh-pages branch
git checkout gh-pages

# Make changes in docs/
# Edit docs/index.html, docs/user-guide.html, etc.

# Commit and push
git add docs/
git commit -m "Update documentation"
git push origin gh-pages

# GitHub Pages auto-deploys in 1-5 minutes
```

### To update code:
```bash
# Switch to main/working branch
git checkout main  # or your working branch

# Make code changes
# No need to touch docs/ - it doesn't exist here!

# Commit and push normally
git add .
git commit -m "Update feature X"
git push origin main
```

## Branch Commits

### gh-pages Branch
- `a6f675b` - Initial commit with all documentation

### Working Branch
- `7ffa490` - Removed documentation files (moved to gh-pages)
- Previous commits created the documentation (now removed)

## Accessing the Branches

```bash
# List all branches
git branch -a

# Switch to gh-pages
git checkout gh-pages

# Switch back to working branch
git checkout copilot/create-github-pages-documentation

# Or switch to main
git checkout main
```

## Summary

✅ **gh-pages**: Clean, documentation-only branch ready for GitHub Pages
✅ **Working branch**: Clean, code-only branch without documentation clutter
✅ **Structure**: Follows GitHub Pages conventions
✅ **Ready**: Documentation can be deployed immediately

---

Created: December 19, 2024
Structure established in commits: a6f675b (gh-pages), 7ffa490 (cleanup)
