import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { withRateLimit, cache, generateCacheKey, withCache } from '@/lib/api-utils';

export async function GET(request, { params }) {
  try {
    await withRateLimit(request);

    const id = params.id;
    
    const cacheKey = generateCacheKey(request);
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return withCache(NextResponse.json(cachedResponse), cacheKey);
    }

    const { db } = await connectToDatabase();
    const prompt = await db.collection('prompts').findOne({
      _id: new ObjectId(id)
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    cache.set(cacheKey, prompt);
    return withCache(NextResponse.json(prompt), cacheKey);
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}