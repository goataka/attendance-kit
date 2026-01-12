# Frontend Workflows

This directory contains references to GitHub Actions workflows specific to the frontend application.

## Visual Snapshots Workflow

The visual regression snapshot workflow is located at:
`.github/workflows/frontend-visual-snapshots.yml`

This workflow is triggered by the main PR workflow (`.github/workflows/pr.yml`) when frontend source files are modified.

### Architecture

- **Event Layer**: `.github/workflows/pr.yml` - Uses paths-filter to detect frontend changes
- **Execution Layer**: `.github/workflows/frontend-visual-snapshots.yml` - Executes visual snapshot updates

### Note

GitHub Actions requires reusable workflows to be located in the `.github/workflows/` directory. While this directory exists for organizational purposes, the actual workflow files must reside in the repository root's `.github/workflows/` directory.
