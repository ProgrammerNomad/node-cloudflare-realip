# Node Cloudflare RealIP

Restore original visitor IP addresses when your Node.js app is behind Cloudflare. This package validates that the incoming connection comes from Cloudflare IP ranges before honoring Cloudflare headers like `CF-Connecting-IP` or `True-Client-IP`.

## Why Use This Package?

When your application is behind Cloudflare, the direct connection comes from Cloudflare's servers, not the actual visitor. Cloudflare provides the real visitor IP in headers like `CF-Connecting-IP`. However, **blindly trusting these headers is a security risk** - anyone could spoof them.

This package:
- **Validates** the connection is actually from Cloudflare by checking IP ranges
- Only then trusts Cloudflare headers to get the real visitor IP
- Works with Express, Fastify, and any Node.js HTTP server
- Includes bundled Cloudflare IP ranges + ability to fetch latest ranges

## Features

- **Secure**: Validates Cloudflare IP ranges before trusting headers
- **Framework agnostic**: Works with Express, Fastify, raw HTTP servers, and more
- **Lightweight**: Minimal dependencies (only `range_check` for IP validation)
- **Auto-update**: Fetch latest Cloudflare IP ranges on demand
- **TypeScript**: Includes TypeScript definitions
- **Fast**: Bundled ranges for offline operation

## Installation

```bash
npm install node-cloudflare-realip
```

**Package is now live on npm!** Visit: [https://www.npmjs.com/package/node-cloudflare-realip](https://www.npmjs.com/package/node-cloudflare-realip)

**Alternative package managers:**

```bash
# Using Yarn
yarn add node-cloudflare-realip

# Using pnpm
pnpm add node-cloudflare-realip

# Using Bun
bun add node-cloudflare-realip
```

## Quick Start

### Express.js

```javascript
const express = require('express');
const cloudflareRealIp = require('node-cloudflare-realip');

const app = express();

// Load Cloudflare IP ranges
cloudflareRealIp.load();

// Apply middleware
app.use(cloudflareRealIp.express());

app.get('/', (req, res) => {
  res.send('Your IP: ' + req.realIp);
});

app.listen(3000);
```

### Fastify

```javascript
const fastify = require('fastify')();
const cloudflareRealIp = require('node-cloudflare-realip');

cloudflareRealIp.load();
fastify.addHook('onRequest', cloudflareRealIp.fastify());

fastify.get('/', async (request, reply) => {
  return { ip: request.realIp };
});

fastify.listen({ port: 3000 });
```

### Raw HTTP Server

```javascript
const http = require('http');
const cloudflareRealIp = require('node-cloudflare-realip');

cloudflareRealIp.load();

http.createServer((req, res) => {
  if (cloudflareRealIp.check(req)) {
    req.realIp = cloudflareRealIp.get(req);
  }
  res.end('Your IP: ' + (req.realIp || req.socket.remoteAddress));
}).listen(3000);
```

## API Reference

### `load([callback])`
Load Cloudflare IP ranges from bundled `ranges.json`. Returns a Promise if no callback provided.

### `updateFromCloudflare()`
Fetch the latest IP ranges from Cloudflare's official endpoints. Returns a Promise with updated ranges.

### `check(req)`
Returns `true` if the request comes from a Cloudflare IP and has CF headers.

### `get(req)`
Returns the real visitor IP from Cloudflare headers or falls back to socket address.

### `express()`
Returns Express middleware that automatically sets `req.realIp`.

### `fastify()`
Returns Fastify onRequest hook function.

## Documentation

- [Full Usage Guide](docs/usage.md)
- [Examples](docs/examples.md) - Express, Fastify, HTTP, TypeScript examples
- [Official Cloudflare Docs](https://developers.cloudflare.com/support/troubleshooting/restoring-visitor-ips/restoring-original-visitor-ips/)

## How It Works

1. Checks if request has Cloudflare headers (`CF-Connecting-IP` or `True-Client-IP`)
2. Validates the connection's IP address is in Cloudflare's IP ranges
3. If validated, trusts the Cloudflare header and sets `req.realIp`
4. Optionally overrides `req.socket.remoteAddress` for seamless integration

## Security

This package only trusts Cloudflare headers when the connection originates from verified Cloudflare IP ranges. This prevents IP spoofing attacks where malicious users could send fake `CF-Connecting-IP` headers.

## Publishing to npm

See [docs/usage.md](docs/usage.md#publishing-to-npm) for publishing instructions.

## License

MIT

## Links

- **npm Package**: [https://www.npmjs.com/package/node-cloudflare-realip](https://www.npmjs.com/package/node-cloudflare-realip)
- **GitHub Repository**: [https://github.com/ProgrammerNomad/node-cloudflare-realip](https://github.com/ProgrammerNomad/node-cloudflare-realip)
- **Issues**: [https://github.com/ProgrammerNomad/node-cloudflare-realip/issues](https://github.com/ProgrammerNomad/node-cloudflare-realip/issues)
# node-cloudflare-realip
Secure Node.js utility to restore real visitor IPs behind Cloudflare by validating Cloudflare IP ranges.
