import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { withRateLimit, cache, generateCacheKey } from '@/lib/api-utils';

export async function GET(request, { params }) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const id = params.id;
    
    // Check cache
    const cacheKey = generateCacheKey(request);
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    const { db } = await connectToDatabase();
    const prompt = await db.collection('prompts').findOne({
      _id: new ObjectId(id)
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Cache the response
    cache.set(cacheKey, prompt);
    return NextResponse.json(prompt);
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}