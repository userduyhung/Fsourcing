#!/usr/bin/env node
/**
 * Simple health-check script to verify the payment-return.html is reachable.
 * Exits with code 0 if reachable (HTTP 200), non-zero otherwise.
 * Usage: node scripts/check-payment-return.js [url]
 */
import https from 'https';
import http from 'http';
import { URL } from 'url';

const defaultUrl = 'https://fsourcing.vercel.app/payment-return.html';
const target = process.argv[2] || defaultUrl;

function check(url) {
  try {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const opts = {
      method: 'GET',
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      timeout: 10000,
      headers: {
        'User-Agent': 'Fsourcing-HealthCheck/1.0'
      }
    };

    const req = lib.request(opts, (res) => {
      const { statusCode } = res;
      if (statusCode && statusCode >= 200 && statusCode < 300) {
        console.log(`OK: ${url} returned ${statusCode}`);
        process.exit(0);
      } else {
        console.error(`FAIL: ${url} returned ${statusCode}`);
        process.exit(2);
      }
    });

    req.on('timeout', () => {
      console.error(`FAIL: ${url} request timed out`);
      req.destroy();
      process.exit(3);
    });

    req.on('error', (err) => {
      console.error(`FAIL: ${url} request error: ${err.message}`);
      process.exit(4);
    });

    req.end();
  } catch (err) {
    console.error('FAIL: invalid URL', err);
    process.exit(5);
  }
}

check(target);
