'use client';

import { useState, useEffect } from 'react';
import { Copy, Globe, Lock, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LoginDialog from './LoginDialog';

export default function PromptCard({ prompt, onEdit, onDelete, onSave, showActions = true, isSaved }) {
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes('userId='));
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    onSave(prompt);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-4 rounded-lg shadow-md mb-4 group ${
          prompt.type === 'system' 
            ? 'bg-blue-50' 
            : 'bg-green-50'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <Link 
            href={`/prompt/${prompt._id}`}
            className="flex-grow hover:underline"
          >
            <h3 className="font-medium text-lg">{prompt.title || 'Untitled'}</h3>
          </Link>
          <div className="flex items-center space-x-2">
            {prompt.isPublic ? (
              <Globe size={16} className="text-green-600" />
            ) : (
              <Lock size={16} className="text-gray-600" />
            )}
            {onSave && (
              <button
                onClick={handleSaveClick}
                className="p-1 hover:text-blue-600 transition-colors"
                title={isSaved ? "Remove from saved" : "Save prompt"}
              >
                {isSaved ? (
                  <BookmarkCheck size={16} className="text-blue-600" />
                ) : (
                  <Bookmark size={16} />
                )}
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="p-1 hover:text-blue-600 transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={16} className={copied ? 'text-green-600' : ''} />
            </button>
          </div>
        </div>
        
        {showActions ? (
          <>
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{prompt.content}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {prompt.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(prompt)}
                  className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 "
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(prompt._id)}
                  className="px-3 py-1 text-sm text-red-600 rounded-md hover:bg-red-50 "
                >
                  Delete
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-wrap">{prompt.content}</p>
        )}
      </motion.div>

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={() => {
          setIsLoggedIn(true);
          onSave(prompt);
        }}
        prompt={prompt}
      />
    </>
  );
}