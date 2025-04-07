'use client';

import { useRouter } from 'next/navigation';
import PromptForm from '../../components/PromptForm';

export default function NewPrompt() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create prompt');

      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Prompt</h1>
      <PromptForm onSubmit={handleSubmit} onCancel={() => router.push('/dashboard')} />
    </div>
  );
}