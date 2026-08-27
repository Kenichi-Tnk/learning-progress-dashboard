'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { register } from '@/src/services/auth-api';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
      }

      const result = await signIn('credentials', {
        redirect: false, // 認証後の自動リダイレクトを無効化
        email,
        password,
      });

      if (result?.error || !result?.ok) {
        setError('メールアドレスまたはパスワードが正しくありません。');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '認証に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Learning Progress
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {mode === 'login' ? 'ログイン' : 'アカウント登録'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === 'login'
            ? '学習記録を確認するにはログインしてください。'
            : '自分の学習記録を管理するアカウントを作成します。'}
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="grid gap-1 text-sm font-medium text-slate-800">
              名前
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          )}
          <label className="grid gap-1 text-sm font-medium text-slate-800">
            メールアドレス
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-800">
            パスワード
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          {mode === 'register' && (
            <label className="grid gap-1 text-sm font-medium text-slate-800">
              パスワード（確認）
              <input
                required
                minLength={8}
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          )}

          {error && (
            <p
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isSubmitting ? '処理中...' : mode === 'login' ? 'ログインする' : '登録する'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          className="mt-4 w-full text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          {mode === 'login' ? 'アカウントを作成する' : 'ログイン画面に戻る'}
        </button>
      </section>
    </main>
  );
}
