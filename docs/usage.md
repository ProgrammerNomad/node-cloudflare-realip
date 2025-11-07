# Usage Guide

**Package Status**: Published and live on npm!  
**Install**: `npm install node-cloudflare-realip`  
**npm Page**: https://www.npmjs.com/package/node-cloudflare-realip

**Also available via:**
- Yarn: `yarn add node-cloudflare-realip`
- pnpm: `pnpm add node-cloudflare-realip`
- Bun: `bun add node-cloudflare-realip`

## Features

- Validate Cloudflare IP ranges before trusting Cloudflare headers.
- Middleware for Express and hook for Fastify.
- Bundled `ranges.json` with a helper to refresh from Cloudflare.

## API

- `load([callback])` - load bundled ranges from `ranges.json`. Returns a Promise if no callback provided.
- `updateFromCloudflare()` - fetch the latest ranges from Cloudflare (returns a Promise).
- `check(req)` - returns true if the incoming connection appears to be from Cloudflare and CF headers exist.
- `get(req)` - returns the best candidate for the original visitor IP (CF headers or fallback to socket remoteAddress).
- `express()` - returns an Express middleware to automatically set `req.realIp` and override `req.socket.remoteAddress` when appropriate.
- `fastify()` - returns a Fastify `onRequest` hook function.

## Updating the Package on npm

The package is already published! To publish updates:

1. Make your changes and commit them.
2. Bump the version: `npm version patch` (or `minor` or `major`).
3. Test packaging locally: `npm pack`.
4. Publish the update: `npm publish --access public`.
5. Push tags to GitHub: `git push && git push --tags`.
