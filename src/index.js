/**
 * node-cloudflare-realip
 * Minimal library to restore real visitor IPs when behind Cloudflare.
 * Supports Express (middleware), Fastify (preHandler hook) and raw http servers.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const rangeCheck = require('range_check');
// adapt to different versions of range_check API
const rc_isIP = rangeCheck.isIP || rangeCheck.valid_ip || rangeCheck.vaild_ip || function () { return false; };
const rc_version = rangeCheck.version || rangeCheck.ver || rangeCheck.ver || function () { return null; };
const rc_inRange = rangeCheck.inRange || rangeCheck.in_range || rangeCheck.in_range || function () { return false; };

const LOCAL_RANGES_FILE = path.resolve(__dirname, '..', 'ranges.json');

let ranges = null;

function _readLocalRanges() {
  try {
    const data = fs.readFileSync(LOCAL_RANGES_FILE, 'utf8');
    ranges = JSON.parse(data);
    return ranges;
  } catch (err) {
    ranges = { v4: [], v6: [] };
    return ranges;
  }
}

function load(callback) {
  // Backwards compatible: callback optional
  if (typeof callback === 'function') {
    try {
      const r = _readLocalRanges();
      callback(null, r);
    } catch (e) {
      callback(e);
    }
    return;
  }
  return Promise.resolve(_readLocalRanges());
}

function updateFromCloudflare() {
  // Fetch v4 and v6 lists from Cloudflare public endpoints
  const urls = [
    'https://www.cloudflare.com/ips-v4',
    'https://www.cloudflare.com/ips-v6'
  ];

  function fetchUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode >= 400) return reject(new Error('Failed to fetch ' + url + ' status ' + res.statusCode));
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });
  }

  return Promise.all(urls.map(fetchUrl)).then(([v4raw, v6raw]) => {
    const v4 = v4raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const v6 = v6raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    ranges = { v4, v6 };
    return ranges;
  });
}

function _getRemoteAddress(req) {
  if (!req) return null;
  // modern Node: socket
  if (req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
  if (req.connection && req.connection.remoteAddress) return req.connection.remoteAddress;
  if (req.remoteAddress) return req.remoteAddress;
  return null;
}

function check(req) {
  if (!req || !req.headers) return false;
  const cfHeader = req.headers['cf-connecting-ip'] || req.headers['true-client-ip'];
  if (!cfHeader) return false;
  if (!ranges) _readLocalRanges();
  const remote = _getRemoteAddress(req);
  if (!remote) return false;
  try {
    const ver = rc_version(remote);
    if (ver === 4 || ver === '4') return rc_inRange(remote, ranges.v4);
    if (ver === 6 || ver === '6') return rc_inRange(remote, ranges.v6);
  } catch (e) {
    return false;
  }
  return false;
}

function get(req) {
  if (!req || !req.headers) return _getRemoteAddress(req);
  // prefer Cloudflare provided headers
  const cf = req.headers['cf-connecting-ip'] || req.headers['true-client-ip'];
  if (cf) return cf;
  // fallback to X-Forwarded-For first entry
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return _getRemoteAddress(req);
}

function _applyRealIpToRequest(req, ip) {
  if (!req) return;
  try {
    if (req.socket && Object.prototype.hasOwnProperty.call(req.socket, 'remoteAddress')) {
      // redefine getter
      Object.defineProperty(req.socket, 'remoteAddress', {
        configurable: true,
        enumerable: true,
        get: function () {
          return ip;
        }
      });
    }
    if (req.connection && Object.prototype.hasOwnProperty.call(req.connection, 'remoteAddress')) {
      Object.defineProperty(req.connection, 'remoteAddress', {
        configurable: true,
        enumerable: true,
        get: function () {
          return ip;
        }
      });
    }
  } catch (e) {
    // ignore
  }
  // Set a friendly property consumers can rely on
  req.realIp = ip;
}

// Express middleware
function express() {
  return function (req, res, next) {
    try {
      if (check(req)) {
        const ip = get(req);
        _applyRealIpToRequest(req, ip);
      }
    } catch (e) {
      // swallow errors in middleware
    }
    return typeof next === 'function' ? next() : undefined;
  };
}

// Fastify preHandler (use as: fastify.addHook('onRequest', require('node-cloudflare-realip').fastify()) )
function fastify() {
  return function (request, reply, done) {
    const raw = request && request.raw ? request.raw : request;
    try {
      if (check(raw)) {
        const ip = get(raw);
        _applyRealIpToRequest(raw, ip);
        // expose on fastify request too
        request.realIp = ip;
      }
    } catch (e) {
      // ignore
    }
    if (typeof done === 'function') return done();
  };
}

module.exports = {
  load,
  updateFromCloudflare,
  check,
  get,
  express,
  fastify,
  _readLocalRanges,
  _applyRealIpToRequest
};
