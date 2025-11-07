# Examples

**Live on npm!** Install with: `npm install node-cloudflare-realip`  
**Package URL**: https://www.npmjs.com/package/node-cloudflare-realip

**Works with all package managers:**
```bash
npm install node-cloudflare-realip   # npm
yarn add node-cloudflare-realip      # Yarn
pnpm add node-cloudflare-realip      # pnpm
bun add node-cloudflare-realip       # Bun
```

## Express.js

```javascript
const express = require('express');
const cloudflareRealIp = require('node-cloudflare-realip');

const app = express();

// Load Cloudflare IP ranges (optional but recommended)
cloudflareRealIp.load();

// Apply middleware
app.use(cloudflareRealIp.express());

app.get('/', (req, res) => {
  // Access real IP via req.realIp or req.socket.remoteAddress
  res.json({
    realIp: req.realIp,
    socketIp: req.socket.remoteAddress
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Fastify

```javascript
const fastify = require('fastify')();
const cloudflareRealIp = require('node-cloudflare-realip');

// Load Cloudflare IP ranges
cloudflareRealIp.load();

// Register as onRequest hook
fastify.addHook('onRequest', cloudflareRealIp.fastify());

fastify.get('/', async (request, reply) => {
  return {
    realIp: request.realIp,
    socketIp: request.raw.socket.remoteAddress
  };
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Server running on port 3000');
});
```

## Raw HTTP Server

```javascript
const http = require('http');
const cloudflareRealIp = require('node-cloudflare-realip');

// Load Cloudflare IP ranges
cloudflareRealIp.load();

const server = http.createServer((req, res) => {
  // Check if request is from Cloudflare
  if (cloudflareRealIp.check(req)) {
    const realIp = cloudflareRealIp.get(req);
    req.realIp = realIp;
    // Optionally override socket.remoteAddress
    cloudflareRealIp._applyRealIpToRequest(req, realIp);
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    realIp: req.realIp || req.socket.remoteAddress
  }));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Update Cloudflare Ranges Dynamically

```javascript
const cloudflareRealIp = require('node-cloudflare-realip');
const fs = require('fs');
const path = require('path');

// Fetch latest ranges from Cloudflare
cloudflareRealIp.updateFromCloudflare()
  .then(ranges => {
    console.log('Updated Cloudflare IP ranges');
    console.log('IPv4 ranges:', ranges.v4.length);
    console.log('IPv6 ranges:', ranges.v6.length);
    
    // Optionally save to file
    const rangesPath = path.join(__dirname, 'custom-ranges.json');
    fs.writeFileSync(rangesPath, JSON.stringify(ranges, null, 2));
  })
  .catch(err => {
    console.error('Failed to update ranges:', err);
  });
```

## With TypeScript

```typescript
import * as cloudflareRealIp from 'node-cloudflare-realip';
import express, { Request, Response } from 'express';

const app = express();

// Extend Express Request type if needed
declare module 'express' {
  interface Request {
    realIp?: string;
  }
}

cloudflareRealIp.load();
app.use(cloudflareRealIp.express());

app.get('/', (req: Request, res: Response) => {
  res.json({ realIp: req.realIp });
});

app.listen(3000);
```

## Advanced: Periodic Range Updates

```javascript
const cloudflareRealIp = require('node-cloudflare-realip');
const fs = require('fs');
const path = require('path');

// Update ranges every 24 hours
async function updateRangesPeriodically() {
  try {
    const ranges = await cloudflareRealIp.updateFromCloudflare();
    
    // Save to local file
    const rangesFile = path.join(__dirname, 'ranges.json');
    fs.writeFileSync(rangesFile, JSON.stringify(ranges, null, 2));
    
    console.log('Cloudflare IP ranges updated successfully');
  } catch (err) {
    console.error('Failed to update Cloudflare ranges:', err);
  }
}

// Initial load
cloudflareRealIp.load();

// Update immediately
updateRangesPeriodically();

// Update every 24 hours
setInterval(updateRangesPeriodically, 24 * 60 * 60 * 1000);
```
