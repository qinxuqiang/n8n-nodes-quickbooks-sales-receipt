# Publishing Guide for n8n-nodes-quickbooks-sales-receipt

This guide explains how to publish your package to npm.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at https://www.npmjs.com/signup
2. **Email Verification**: Verify your npm email address
3. **Two-Factor Authentication**: Enable 2FA for your npm account (recommended)

## Before Publishing

### 1. Update Package Information

Edit `package.json` and update:
- `author.name`: Your name
- `author.email`: Your email
- `homepage`: Your GitHub repository URL
- `repository.url`: Your GitHub repository URL

### 2. Initialize Git Repository (if not done)

```bash
cd /Users/Orcqxq/n8n_receipt/n8n-nodes-quickbooks-sales-receipt
git init
git add .
git commit -m "Initial commit: QuickBooks Sales Receipt node"
```

### 3. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `n8n-nodes-quickbooks-sales-receipt`
3. Push your code:

```bash
git remote add origin https://github.com/yourusername/n8n-nodes-quickbooks-sales-receipt.git
git branch -M main
git push -u origin main
```

## Publishing to npm

### 1. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 2. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows the files that will be included in your package.

### 3. Publish

```bash
npm publish
```

If this is your first time publishing this package, it should succeed immediately.

### 4. Verify Publication

Visit https://www.npmjs.com/package/n8n-nodes-quickbooks-sales-receipt to see your published package.

## Updating the Package

When you make changes and want to publish a new version:

### 1. Update Version

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 2. Build and Test

```bash
npm run build
npm test
```

### 3. Commit and Push

```bash
git add .
git commit -m "Version bump and changes"
git push
git push --tags
```

### 4. Publish

```bash
npm publish
```

## Package Status

✅ **Package Structure**: Complete
✅ **TypeScript Build**: Successful
✅ **Tests**: All 13 tests passing
✅ **Files Ready**: dist/ folder contains compiled code
✅ **Documentation**: README.md complete

## Next Steps for You

1. **Update package.json** with your personal information
2. **Create GitHub repository** and push your code
3. **Login to npm**: `npm login`
4. **Publish**: `npm publish`

## Troubleshooting

### Package name already taken

If someone else has already taken the package name `n8n-nodes-quickbooks-sales-receipt`, you can:

1. Use a scoped package: `@yourusername/n8n-nodes-quickbooks-sales-receipt`
2. Choose a different name following the pattern: `n8n-nodes-quickbooks-*`

To publish a scoped package:

```bash
npm publish --access public
```

### Publishing fails

- Make sure you're logged in: `npm whoami`
- Verify your email is confirmed on npmjs.com
- Check that the package name isn't already taken
- Ensure your package.json is valid: `npm pack --dry-run`

## Installation Instructions for Users

Once published, users can install your node in their n8n instance:

### Via n8n UI

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-quickbooks-sales-receipt`
4. Click **Install**

### Via Command Line

```bash
cd ~/.n8n
npm install n8n-nodes-quickbooks-sales-receipt
```

Then restart n8n.

## Support

For issues or questions, users can visit your GitHub repository's Issues section.


