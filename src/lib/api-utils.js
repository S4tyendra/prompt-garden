import { LRUCache } from 'lru-cache';
import rateLimit from 'express-rate-limit';

// LRU Cache configuration
export const cache = new LRUCache({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes in milliseconds
});

// Rate limiter configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter middleware for Next.js API routes
export async function withRateLimit(req) {
  return new Promise((resolve, reject) => {
    rateLimiter(req, {}, (result) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });
}

// Cache key generator
export function generateCacheKey(request, additionalParams = {}) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  return JSON.stringify({ path: url.pathname, params: { ...params, ...additionalParams } });
}