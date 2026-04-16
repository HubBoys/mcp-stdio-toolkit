# @summyer/mcp-stdio-toolkit

A reusable stdio MCP server. Current tool set includes a signature tool based on appKey and appSecret.

Detailed release handbook: docs/npm-publish-workflow.md

## Current Tool: get_sign

Algorithm:

1. timestamp = Date.now()
2. data = `${timestamp}\n${appSecret}\n${appKey}`
3. signatureBase64 = Base64(HMAC_SHA256(data, appSecret))
4. sign = `${timestamp}${signatureBase64}`

Return fields:

- timestamp
- signatureBase64
- sign

## Local Development

npm install
npm start

## MCP Host Config (stdio + npx)

{
  "mcpServers": {
    "toolkit": {
      "command": "npx",
      "args": ["-y", "@summyer/mcp-stdio-toolkit"]
    }
  }
}

## Tool Input Example

{
  "appKey": "your-app-key",
  "appSecret": "your-app-secret"
}

## Publish to npm (Public)

1. npm login
2. Bump version with `npm version patch`, `npm version minor`, or `npm version major`
3. Push commit and tag: `git push --follow-tags`
4. Wait for GitHub Actions publish job to finish
5. Verify with `npm view @summyer/mcp-stdio-toolkit` and `npx -y @summyer/mcp-stdio-toolkit`

Note: this repository uses Trusted Publishing in GitHub Actions. Do not run local `npm publish --provenance ...`.

## GitHub Actions Auto Publish

This repository includes a tag-triggered workflow at `.github/workflows/publish.yml`.

Trusted Publishing setup (recommended, no `NPM_TOKEN` required):

1. In npm package settings, open Trusted Publishers.
2. Add a GitHub Actions publisher for this repository.
3. Set workflow file to `.github/workflows/publish.yml`.
4. Set branch/tag policy to match your release flow.

If Trusted Publishing is not available for your account, you can temporarily use token-based publishing as a fallback.

Recommended release flow:

1. Bump the version with `npm version patch`, `npm version minor`, or `npm version major`.
2. Push the commit and the generated tag, for example `v0.1.1`.
3. The workflow publishes the package to npm automatically.

Example:

```bash
npm version patch
git push --follow-tags
```

The workflow uses `npm publish --provenance --access public`.

## Public Release Plan (Recommended)

1. Keep semver: 0.1.0 -> 0.1.1 -> 0.2.0 -> 1.0.0
2. Add changelog each release
3. Use npm Trusted Publishing (OIDC) for automated publishing
4. Never print secrets in logs
5. Add new tools in src/index.js under MCP tool handlers
