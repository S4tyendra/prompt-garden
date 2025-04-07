'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PromptForm from '../../../components/PromptForm';

export default function EditPrompt() {
  const router = useRouter();
  const params = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompt();
  }, [params.id]);

  const fetchPrompt = async () => {
    try {
      const res = await fetch(`/api/prompts/${params.id}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch prompt');
      }
      const data = await res.json();
      setPrompt(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update prompt');

      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">Loading...</div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-12">Prompt not found</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Prompt</h1>
      <PromptForm 
        prompt={prompt} 
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/dashboard')} 
      />
    </div>
  );
}