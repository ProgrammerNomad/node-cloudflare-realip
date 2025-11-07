const express = require('express');
const cloudflareRealIp = require('../src/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Load Cloudflare IP ranges
console.log('Loading Cloudflare IP ranges...');
cloudflareRealIp.load()
  .then(() => {
    console.log('Cloudflare IP ranges loaded successfully');
  })
  .catch(err => {
    console.error('Failed to load ranges:', err);
  });

// Apply Cloudflare Real IP middleware
app.use(cloudflareRealIp.express());

// Example routes
app.get('/', (req, res) => {
  res.json({
    message: 'Cloudflare Real IP Example',
    realIp: req.realIp,
    socketRemoteAddress: req.socket.remoteAddress,
    headers: {
      'cf-connecting-ip': req.headers['cf-connecting-ip'],
      'true-client-ip': req.headers['true-client-ip'],
      'x-forwarded-for': req.headers['x-forwarded-for']
    }
  });
});

app.get('/check', (req, res) => {
  const isCloudflare = cloudflareRealIp.check(req);
  const realIp = cloudflareRealIp.get(req);
  
  res.json({
    isFromCloudflare: isCloudflare,
    realIp: realIp,
    socketIp: req.socket.remoteAddress
  });
});

app.get('/update-ranges', async (req, res) => {
  try {
    const ranges = await cloudflareRealIp.updateFromCloudflare();
    res.json({
      message: 'Cloudflare IP ranges updated',
      ipv4Count: ranges.v4.length,
      ipv6Count: ranges.v6.length
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to update ranges',
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET /         - Show your real IP and headers`);
  console.log(`  GET /check    - Check if request is from Cloudflare`);
  console.log(`  GET /update-ranges - Update Cloudflare IP ranges\n`);
});
