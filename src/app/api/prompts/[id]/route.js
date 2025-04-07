import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, props) {
  const params = await props.params;
  try {
    const { db } = await connectToDatabase();
    const prompt = await db.collection('prompts').findOne({
      _id: new ObjectId(params.id)
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check if the prompt is public or if the user owns it
    const cks = await cookies();
    const userId = cks.get('userId')?.value;

    if (!prompt.isPublic && (!userId || prompt.userId.toString() !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}