'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { path: '/dashboard', label: 'My Prompts' },
    { path: '/dashboard/saved', label: 'Saved Prompts' },
    { path: '/dashboard/new', label: 'New Prompt' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8">
        <ul className="flex space-x-4 border-b">
          {navItems.map(({ path, label }) => (
            <li key={path}>
              <Link
                href={path}
                className={`px-4 py-2 inline-block ${
                  pathname === path
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </div>
  );
}