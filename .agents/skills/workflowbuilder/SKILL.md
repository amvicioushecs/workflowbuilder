```markdown
# workflowbuilder Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `workflowbuilder` TypeScript repository. You'll learn how to structure files, write imports/exports, and follow the project's coding style. This guide also covers how to write and locate tests, and provides suggested commands for common tasks.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example:  
    ```
    my-component.ts
    workflow-utils.ts
    ```

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { buildWorkflow } from './workflow-utils';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // In workflow-utils.ts
    export function buildWorkflow() { ... }
    ```

### Commit Messages
- Freeform style, often starting with a title.
- Average commit message length: ~59 characters.

## Workflows

_No specific workflows detected in the repository._

## Testing Patterns

- **Test Framework:** Unknown (not detected)
- **Test File Pattern:** All test files match `*.test.*`
  - Example:
    ```
    workflow-utils.test.ts
    ```
- Place test files alongside the code or in a dedicated test folder, following the same naming conventions.

## Commands

| Command         | Purpose                                |
|-----------------|----------------------------------------|
| /new-file       | Create a new TypeScript file (kebab-case) |
| /add-test       | Add a new test file for a module        |
| /list-tests     | List all test files in the project      |
| /lint           | Run linter to check code style          |

```