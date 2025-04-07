'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PromptCard from '../components/PromptCard';
import PromptForm from '../components/PromptForm';

export default function Dashboard() {
  const router = useRouter();
  const [prompts, setPrompts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
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

  const handleSubmit = async (formData) => {
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const res = await fetch('/api/prompts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save prompt');

      setShowForm(false);
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const res = await fetch(`/api/prompts?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete prompt');
      fetchPrompts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Prompt Garden</h1>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingPrompt(null);
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {showForm ? 'Cancel' : 'New Prompt'}
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              Loading...
            </motion.div>
          ) : showForm ? (
            <PromptForm
              key="form"
              prompt={editingPrompt}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPrompt(null);
              }}
            />
          ) : (
            <motion.div
              key="prompts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {prompts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No prompts yet. Create your first one!
                </div>
              ) : (
                <div className="space-y-6">
                  {prompts.map((prompt) => (
                    <PromptCard
                      key={prompt._id}
                      prompt={prompt}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}