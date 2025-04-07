import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/api-utils';

export async function POST(request) {
  try {
    // Apply more strict rate limiting for auth endpoints
    await withRateLimit(request);

    const { action, username, password } = await request.json();
    const { db } = await connectToDatabase();

    if (action === 'login') {
      const user = await db.collection('users').findOne({ username, password });
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }), 
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      const cks = await cookies();
      cks.set('userId', user._id.toString(), { 
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
      });
      return new Response(
        JSON.stringify({ success: true }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'signup') {
      const existingUser = await db.collection('users').findOne({ username });
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Username already exists' }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const result = await db.collection('users').insertOne({
        username,
        password,
        createdAt: new Date()
      });
      const cks = await cookies();
      cks.set('userId', result.insertedId.toString(), { 
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
      });
      return new Response(
        JSON.stringify({ success: true }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    if (error.message.includes('Too many requests')) {
      return new Response(
        JSON.stringify({ error: 'Too many requests, please try again later' }), 
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes in seconds
          }
        }
      );
    }
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}