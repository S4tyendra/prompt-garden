'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PromptForm({ prompt, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'user',
    content: '',
    tags: '',
    isPublic: false
  });

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title || '',
        type: prompt.type,
        content: prompt.content,
        tags: prompt.tags?.join(', ') || '',
        isPublic: prompt.isPublic || false
      });
    }
  }, [prompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];
    
    onSubmit({
      ...formData,
      tags,
      ...(prompt && { id: prompt._id })
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700"
          placeholder="Give your prompt a title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="user">User</option>
          <option value="system">System</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 min-h-[150px]"
          placeholder="Enter your prompt content"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700"
          placeholder="creativity, coding, etc."
        />
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Make Public
        </label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
          />
          <label
            htmlFor="isPublic"
            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
              formData.isPublic ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {prompt ? 'Update' : 'Create'} Prompt
        </motion.button>
      </div>
    </motion.form>
  );
}