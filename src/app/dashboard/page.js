'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import PromptCard from '../components/PromptCard';

export default function Dashboard() {
  const router = useRouter();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
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

  const handleEdit = (prompt) => {
    router.push(`/dashboard/edit/${prompt._id}`);
  };

  const handleDelete = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const res = await fetch(`/api/prompts?id=${promptId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete prompt');
      fetchPrompts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Prompts</h1>
        <button
          onClick={() => router.push('/dashboard/new')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Prompt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {prompts.map((prompt) => (
          <div
            key={prompt._id}
            onClick={() => router.push(`/prompt/${prompt._id}`)}
            className="cursor-pointer"
          >
            <PromptCard
              prompt={prompt}
              showActions={false}
              onEdit={(e) => {
                e.stopPropagation();
                handleEdit(prompt);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                handleDelete(prompt._id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}