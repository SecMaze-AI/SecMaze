# Contributing to SecMaze

Thank you for your interest in contributing to SecMaze! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the [SecMaze Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@secmaze.xyz](mailto:conduct@secmaze.xyz).

## Getting Started

To get started with development:

1. Fork the repository on GitHub
2. Clone your fork to your local machine
   ```bash
   git clone https://github.com/YOUR-USERNAME/SecMaze.git
   cd SecMaze
   ```
3. Add the original repository as a remote
   ```bash
   git remote add upstream https://github.com/SecMaze-AI/SecMaze.git
   ```
4. Install dependencies
   ```bash
   npm install
   ```
5. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

The recommended development workflow is:

1. Pull the latest changes from the upstream master branch
   ```bash
   git pull upstream master
   ```
2. Create a new branch for your feature or bug fix
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them with descriptive commit messages
   ```bash
   git commit -m "feat: add new feature"
   ```
4. Push your changes to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request against the upstream master branch

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `perf:` - A code change that improves performance
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools

## Pull Request Process

1. Ensure your code follows the project's coding standards and passes all tests
2. Update the documentation to reflect any changes you've made
3. Submit your pull request with a clear title and description
4. Address any feedback from reviewers

Pull requests will typically be reviewed within 1-2 business days. You may be asked to make changes before your PR is merged.

## Coding Standards

We follow a consistent coding style across the project:

### JavaScript/TypeScript

- Use ESLint with our provided configuration
- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for string literals
- Use camelCase for variables and functions, PascalCase for classes and components
- Add JSDoc comments for functions and complex code

### CSS/SCSS

- Use consistent naming conventions (we follow BEM)
- Group related properties together
- Add comments for complex selectors or calculations

## Testing

All new features and bug fixes should include appropriate tests:

1. Unit tests for individual functions and components
2. Integration tests for API endpoints
3. End-to-end tests for complex workflows

To run tests:

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --testPathPattern=src/maze

# Run tests in watch mode (for development)
npm test -- --watch
```

## Documentation

Good documentation is crucial for the success of the project. Please document:

- New features and API endpoints
- Non-obvious behavior or edge cases
- Complex algorithms or data structures
- Configuration options

Update the relevant documentation files in the `docs/` directory for substantial changes.

## Community

Join our community channels:

- [Twitter](https://x.com/secmaze_)
- [GitHub Discussions](https://github.com/SecMaze-AI/SecMaze/discussions)

---

Thank you for contributing to SecMaze! Your time and expertise help make this project better for everyone. 