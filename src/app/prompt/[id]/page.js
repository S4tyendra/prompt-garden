'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PromptCard from '../../components/PromptCard';

export default function PromptView() {
  const params = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchPrompt();
    checkIfSaved();
  }, [params.id]);

  const fetchPrompt = async () => {
    try {
      const res = await fetch(`/api/prompts/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch prompt');
      const data = await res.json();
      setPrompt(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const res = await fetch('/api/prompts?view=saved');
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.some(p => p._id === params.id));
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSave = async (prompt) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: prompt._id,
          action: 'save',
          isPublic: !isSaved,
        }),
      });

      if (res.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Prompt not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PromptCard
        prompt={prompt}
        showActions={true}
        onSave={handleSave}
        isSaved={isSaved}
      />
    </div>
  );
}