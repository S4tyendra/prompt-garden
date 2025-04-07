import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { withRateLimit, cache, generateCacheKey } from '@/lib/api-utils';

export async function GET(request) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'private';
    const cks = await cookies();
    const userId = cks.get('userId')?.value;

    // Generate cache key based on view and userId
    const cacheKey = generateCacheKey(request, { userId });
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    const { db } = await connectToDatabase();
    let prompts;
    
    if (view === 'public') {
      prompts = await db.collection('prompts')
        .find({ isPublic: true })
        .sort({ updatedAt: -1 })
        .toArray();
    } else if (view === 'saved' && userId) {
      prompts = await db.collection('prompts')
        .find({ savedBy: new ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .toArray();
    } else if (userId) {
      prompts = await db.collection('prompts')
        .find({ userId: new ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .toArray();
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cache the response
    cache.set(cacheKey, prompts);
    return NextResponse.json(prompts);
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const cks = await cookies();
    const userId = cks.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, content, title, tags, isPublic } = await request.json();
    const { db } = await connectToDatabase();

    const now = new Date();
    const prompt = {
      userId: new ObjectId(userId),
      type,
      content,
      title,
      tags: tags || [],
      isPublic: isPublic || false,
      savedBy: [],
      versions: [{
        content,
        createdAt: now
      }],
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('prompts').insertOne(prompt);
    
    // Invalidate relevant caches
    const cachePattern = new RegExp(request.url);
    for (const key of cache.keys()) {
      if (cachePattern.test(key)) {
        cache.delete(key);
      }
    }
    
    return NextResponse.json({ ...prompt, _id: result.insertedId });
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const cks = await cookies();
    const userId = cks.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, type, content, title, tags, isPublic, action } = await request.json();
    const { db } = await connectToDatabase();

    if (action === 'save') {
      const operation = isPublic ? '$addToSet' : '$pull';
      await db.collection('prompts').updateOne(
        { _id: new ObjectId(id) },
        { [operation]: { savedBy: new ObjectId(userId) } }
      );
    } else {
      const prompt = await db.collection('prompts').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId)
      });

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }

      const now = new Date();
      const update = {
        $set: {
          type,
          content,
          title,
          tags: tags || [],
          isPublic,
          updatedAt: now
        },
        $push: {
          versions: {
            content,
            createdAt: now
          }
        }
      };

      await db.collection('prompts').updateOne(
        { _id: new ObjectId(id) },
        update
      );
    }

    // Invalidate relevant caches
    const cachePattern = new RegExp(request.url);
    for (const key of cache.keys()) {
      if (cachePattern.test(key)) {
        cache.delete(key);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const cks = await cookies();
    const userId = cks.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { db } = await connectToDatabase();
    const result = await db.collection('prompts').deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Invalidate relevant caches
    const cachePattern = new RegExp(request.url);
    for (const key of cache.keys()) {
      if (cachePattern.test(key)) {
        cache.delete(key);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}