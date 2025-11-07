# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-07

### Added
- Initial release
- Express.js middleware support
- Fastify onRequest hook support
- Raw HTTP server helpers (`check`, `get`)
- Bundled Cloudflare IP ranges (IPv4 and IPv6)
- `updateFromCloudflare()` function to fetch latest IP ranges
- TypeScript definitions
- Comprehensive documentation and examples
- Security validation of Cloudflare IP ranges before trusting headers
- Support for `CF-Connecting-IP` and `True-Client-IP` headers
- Automatic override of `req.socket.remoteAddress` when validated
- `req.realIp` property for easy access to visitor IP

### Security
- IP range validation prevents header spoofing attacks
- Only trusts Cloudflare headers when connection originates from verified Cloudflare IPs

## [Unreleased]

### Planned
- Add more comprehensive test coverage
- Add ESM (ES Modules) support
- Add Koa middleware support
- Add automatic periodic IP range updates option
- Add CLI tool for updating ranges
