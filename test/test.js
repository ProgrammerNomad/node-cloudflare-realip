const assert = require('assert');
const cf = require('../src/index');

async function run() {
  // load bundled ranges
  await cf.load();

  // Fake request coming from cloudflare ip with header
  const fakeReq = {
    headers: { 'cf-connecting-ip': '203.0.113.45' },
    socket: { remoteAddress: '103.21.244.5' }
  };

  // Debug: ensure ranges are loaded
  const localRanges = cf._readLocalRanges();
  console.log('Loaded ranges v4 count:', localRanges.v4.length);
  console.log('Has 103.21.244.0/22?', localRanges.v4.indexOf('103.21.244.0/22') !== -1);

  const isCf = cf.check(fakeReq);
  console.log('check returned', isCf);
  // It should be true because remote address belongs to CF ranges in bundled ranges.json
  assert.strictEqual(isCf, true, 'Expected request to be recognized as Cloudflare');

  const ip = cf.get(fakeReq);
  console.log('get returned', ip);
  assert.strictEqual(ip, '203.0.113.45');

  // apply and ensure property present
  cf._applyRealIpToRequest(fakeReq, ip);
  assert.strictEqual(fakeReq.realIp, ip);

  console.log('All tests passed');
}

run().catch((err) => {
  console.error('Test failed:', err && err.stack ? err.stack : err);
  process.exitCode = 2;
});
