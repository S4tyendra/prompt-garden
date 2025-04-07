'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromptCard({ prompt, onEdit, onDelete }) {
  const [showVersions, setShowVersions] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg shadow-md mb-4 ${
        prompt.type === 'system' 
          ? 'bg-blue-50 dark:bg-blue-900/30' 
          : 'bg-green-50 dark:bg-green-900/30'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-lg">{prompt.title || 'Untitled'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Type: {prompt.type}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={copyToClipboard}
          className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/5"
          title="Copy to clipboard"
        >
          <Copy size={16} className={copied ? 'text-green-500' : ''} />
        </motion.button>
      </div>

      <p className="whitespace-pre-wrap mb-3">{prompt.content}</p>

      {prompt.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {prompt.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs rounded-full bg-black/10 dark:bg-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <button
          onClick={() => setShowVersions(!showVersions)}
          className="text-gray-600 dark:text-gray-400 hover:underline"
        >
          {showVersions ? 'Hide versions' : 'Show versions'}
        </button>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(prompt)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(prompt._id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {showVersions && prompt.versions && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 border-t pt-4 space-y-3"
        >
          <h4 className="font-medium">Previous Versions:</h4>
          {prompt.versions.map((version, i) => (
            <div key={i} className="text-sm bg-black/5 dark:bg-white/5 p-3 rounded">
              <p className="whitespace-pre-wrap">{version.content}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {new Date(version.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}