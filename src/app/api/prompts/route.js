import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'private';
    const cks = await cookies();
    const userId = cks.get('userId')?.value;

    const { db } = await connectToDatabase();
    
    if (view === 'public') {
      // Public feed - show all public prompts
      const prompts = await db.collection('prompts')
        .find({ isPublic: true })
        .sort({ updatedAt: -1 })
        .toArray();
      return NextResponse.json(prompts);
    } else if (view === 'saved' && userId) {
      // Saved prompts
      const prompts = await db.collection('prompts')
        .find({ savedBy: new ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .toArray();
      return NextResponse.json(prompts);
    } else if (userId) {
      // User's own prompts
      const prompts = await db.collection('prompts')
        .find({ userId: new ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .toArray();
      return NextResponse.json(prompts);
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
    return NextResponse.json({ ...prompt, _id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cks = await cookies();
    const userId = cks.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, type, content, title, tags, isPublic, action } = await request.json();
    const { db } = await connectToDatabase();

    if (action === 'save') {
      // Handle saving/unsaving prompts
      const operation = isPublic ? '$addToSet' : '$pull';
      await db.collection('prompts').updateOne(
        { _id: new ObjectId(id) },
        { [operation]: { savedBy: new ObjectId(userId) } }
      );
      return NextResponse.json({ success: true });
    }

    // Regular prompt update
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}