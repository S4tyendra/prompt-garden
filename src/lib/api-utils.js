import { LRUCache } from 'lru-cache';
import rateLimit from 'express-rate-limit';
import { headers } from 'next/headers';

// LRU Cache configuration
export const cache = new LRUCache({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes in milliseconds
});

// Custom key generator for rate limiting
function keyGenerator(request) {
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  return ip.replace(/:\d+[^:]*$/, ''); // Strip port number if present
}

// Rate limiter configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  validate: { ip: false }, // Disable built-in IP validation since we handle it in keyGenerator
  handler: (_, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
  skip: () => false, // Don't skip any requests
});

// Rate limiter middleware for Next.js API routes
export async function withRateLimit(req) {
  return new Promise((resolve, reject) => {
    const res = {
      status: () => res,
      setHeader: () => res,
      json: (data) => {
        if (data.error) {
          reject(new Error(data.error));
        }
        resolve();
      },
    };
    
    rateLimiter(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve();
    });
  });
}

// Cache key generator
export function generateCacheKey(request, additionalParams = {}) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const cacheKey = JSON.stringify({ 
    path: url.pathname, 
    params: { ...params, ...additionalParams } 
  });
  
  return cacheKey;
}

// Cache middleware with headers for Next.js API routes
export function withCache(response, cacheKey) {
  if (!response || !response.ok) return response;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'HIT',
      },
    });
  }
  
  // If not in cache, cache the response data
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'Cache-Control': 'public, max-age=300',
      'X-Cache': 'MISS',
    },
  });
}