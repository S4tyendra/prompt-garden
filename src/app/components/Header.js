'use client';

import Link from 'next/link';
import { Home, Plus, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginDialog from './LoginDialog';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    // Check if user is logged in by checking for userId cookie
    setIsLoggedIn(document.cookie.includes('userId='));
  }, []);

  return (
    <>
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-gray-800 hover:text-blue-600">
            <Home size={24} />
            <span className="font-medium">Prompt Garden</span>
          </Link>

          <div>
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <Plus size={20} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <button 
                onClick={() => setShowLoginDialog(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <LogIn size={20} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={() => {
          setIsLoggedIn(true);
          setShowLoginDialog(false);
        }}
      />
    </>
  );
}