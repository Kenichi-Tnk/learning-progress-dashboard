'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          学習記録アプリ
        </Link>
        <div>
          {status === 'loading' ? (
            <p>Loading...</p>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <p>ようこそ, {session.user?.name}さん</p>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              ログイン
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
