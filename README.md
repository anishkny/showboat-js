# showboat-js

npm wrapper for [showboat](https://github.com/simonw/showboat) - Create executable demo documents that show and prove an agent's work.

## Installation

You can run showboat without installing it first using `npx`:

```bash
npx showboat --help
```

Or install it globally:

```bash
npm install -g showboat
showboat --help
```

Or add it to your project:

```bash
npm install showboat
npx showboat --help
```

## Usage

Showboat helps agents build markdown documents that mix commentary, executable code blocks, and captured output. These documents serve as both readable documentation and reproducible proof of work.

```bash
# Create a new demo document
showboat init demo.md "My Demo"

# Add commentary
showboat note demo.md "This is a note"

# Execute code and capture output
showboat exec demo.md bash "echo Hello World"

# View the document
cat demo.md
```

For more information, see the [showboat documentation](https://github.com/simonw/showboat).

## Programmatic API

You can also use showboat programmatically in your Node.js code:

```javascript
const showboat = require("showboat");

// Execute showboat with arguments
const result = await showboat(["--version"]);
console.log(result.stdout); // showboat version

// Create a demo document
await showboat(["init", "demo.md", "My Demo"]);
await showboat(["note", "demo.md", "This is a note"]);
const output = await showboat(["exec", "demo.md", "bash", "echo Hello"]);
console.log(output.stdout); // "Hello"
```

## About

This is an npm wrapper around the [showboat](https://github.com/simonw/showboat) Go binary. It automatically downloads the appropriate binary for your platform during installation.

## Development

### Running Tests

This project includes automated tests using Jest:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## License

Apache-2.0 (same as showboat)
