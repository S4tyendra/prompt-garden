'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PromptCard from '../../components/PromptCard';

export default function SavedPrompts() {
  const router = useRouter();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts?view=saved');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch prompts');
      }
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (prompt) => {
    try {
      await fetch('/api/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: prompt._id,
          action: 'save',
          isPublic: false,
        }),
      });
      fetchPrompts(); // Refresh the list after unsaving
    } catch (error) {
      console.error('Error unsaving prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Prompts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.length === 0 ? (
          <div className="text-gray-500 col-span-full text-center py-12">
            No saved prompts yet.
          </div>
        ) : (
          prompts.map((prompt) => (
            <PromptCard
              key={prompt._id}
              prompt={prompt}
              showActions={true}
              onSave={handleSave}
              isSaved={true}
            />
          ))
        )}
      </div>
    </div>
  );
}