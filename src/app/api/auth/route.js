import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/api-utils';

export async function POST(request) {
  try {
    // Apply rate limiting
    await withRateLimit(request);

    const { action, username, password } = await request.json();
    const { db } = await connectToDatabase();

    if (action === 'login') {
      const user = await db.collection('users').findOne({ username, password });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const cks = await cookies();
      cks.set('userId', user._id.toString(), { secure: true });
      return NextResponse.json({ success: true });
    }

    if (action === 'signup') {
      const existingUser = await db.collection('users').findOne({ username });
      if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      const result = await db.collection('users').insertOne({
        username,
        password,
        createdAt: new Date()
      });
      const cks = await cookies();
      cks.set('userId', result.insertedId.toString(), { secure: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}