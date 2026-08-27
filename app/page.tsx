'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LearningRecordForm } from '@/src/components/learning-record-form';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return <main className="min-h-screen bg-slate-100" />;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Learning Progress Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          {session.user?.name ? `${session.user.name}さんの学習記録` : '学習記録'}
        </p>
      </div>
      <LearningRecordForm accessToken={session.accessToken} />
    </main>
  );
}
