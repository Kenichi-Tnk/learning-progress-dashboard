'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { validateLearningRecordInput } from '@/src/lib/learning-record-validation';
import { InMemoryLearningRecordAPI } from '@/src/services/learning-record-api';
import type {
  LearningCategory,
  LearningRecord,
  LearningRecordInput,
} from '@/src/types/learning-record';

const categoryLabels: Record<LearningCategory, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  algorithm: 'アルゴリズム',
  infra: 'インフラ',
  other: 'その他',
};

const initialForm: LearningRecordInput = {
  date: '',
  title: '',
  minutes: 30,
  category: 'frontend',
  note: '',
};

export const LearningRecordForm = () => {
  const [learningRecordApi] = useState(() => new InMemoryLearningRecordAPI());
  const [form, setForm] = useState<LearningRecordInput>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | LearningCategory>('all');
  const [summaryRange, setSummaryRange] = useState<'last7days' | 'monthToDate'>('last7days');

  useEffect(() => {
    const loadRecords = async () => {
      const loadedRecords = await learningRecordApi.getAll();
      setRecords(loadedRecords);
    };

    void loadRecords();
  }, [learningRecordApi]);

  const totalMinutes = useMemo(
    () => records.reduce((sum, record) => sum + record.minutes, 0),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        record.title.toLowerCase().includes(normalizedSearch) ||
        record.note.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [records, filterCategory, searchTerm]);

  const periodSummary = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfWeek = now.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);

    const initial = {
      weeklyCount: 0,
      weeklyMinutes: 0,
      monthlyCount: 0,
      monthlyMinutes: 0,
    };

    return records.reduce((acc, record) => {
      const recordDate = new Date(`${record.date}T00:00:00`);
      if (Number.isNaN(recordDate.getTime())) {
        return acc;
      }

      if (recordDate >= weekStart && recordDate <= todayEnd) {
        acc.weeklyCount += 1;
        acc.weeklyMinutes += record.minutes;
      }

      if (recordDate >= monthStart && recordDate <= todayEnd) {
        acc.monthlyCount += 1;
        acc.monthlyMinutes += record.minutes;
      }

      return acc;
    }, initial);
  }, [records]);

  const rangeSummary = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const rangeStart = summaryRange === 'last7days' ? sevenDaysStart : monthStart;

    const categoryMinutes: Record<LearningCategory, number> = {
      frontend: 0,
      backend: 0,
      algorithm: 0,
      infra: 0,
      other: 0,
    };

    const result = records.reduce(
      (acc, record) => {
        const recordDate = new Date(`${record.date}T00:00:00`);
        if (Number.isNaN(recordDate.getTime())) {
          return acc;
        }

        if (recordDate < rangeStart || recordDate > todayEnd) {
          return acc;
        }

        acc.count += 1;
        acc.minutes += record.minutes;
        acc.categoryMinutes[record.category] += record.minutes;
        return acc;
      },
      {
        count: 0,
        minutes: 0,
        categoryMinutes,
      }
    );

    return result;
  }, [records, summaryRange]);

  const categoryBars = useMemo(() => {
    const entries = (Object.keys(categoryLabels) as LearningCategory[]).map((category) => ({
      category,
      label: categoryLabels[category],
      minutes: rangeSummary.categoryMinutes[category],
    }));

    const maxMinutes = Math.max(...entries.map((entry) => entry.minutes), 0);

    return entries.map((entry) => ({
      ...entry,
      widthPercent: maxMinutes === 0 ? 0 : Math.round((entry.minutes / maxMinutes) * 100),
    }));
  }, [rangeSummary]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateLearningRecordInput(form);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingRecordId) {
      const updatedRecord = await learningRecordApi.update(editingRecordId, form);
      setRecords((prev) =>
        prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
      );
      setEditingRecordId(null);
    } else {
      const savedRecord = await learningRecordApi.add(form);
      setRecords((prev) => [savedRecord, ...prev]);
    }

    setErrors([]);
    setForm(initialForm);
  };

  const handleEdit = (record: LearningRecord) => {
    setForm({
      date: record.date,
      title: record.title,
      minutes: record.minutes,
      category: record.category,
      note: record.note,
    });
    setEditingRecordId(record.id);
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await learningRecordApi.delete(id);
    setRecords((prev) => prev.filter((record) => record.id !== id));

    if (editingRecordId === id) {
      setEditingRecordId(null);
      setForm(initialForm);
      setErrors([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setForm(initialForm);
    setErrors([]);
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">学習記録フォーム</h2>
      <p className="mt-1 text-sm text-slate-600">
        学習内容を記録して、進捗を少しずつ積み上げましょう。
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">日付</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">タイトル</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="例: React hooks の復習"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium !text-slate-800">
            <span className="!text-slate-900">学習時間（分）</span>
            <input
              type="number"
              min={1}
              value={form.minutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minutes: Number(e.target.value || 0),
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium !text-slate-800">
            <span className="!text-slate-900">カテゴリ</span>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  category: e.target.value as LearningCategory,
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring"
            >
              {(Object.keys(categoryLabels) as LearningCategory[]).map((key) => (
                <option key={key} value={key}>
                  {categoryLabels[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">メモ</span>
          <textarea
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            rows={4}
            maxLength={500}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
          />
        </label>

        {errors.length > 0 && (
          <ul className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm !text-rose-700">
            {errors.map((error) => (
              <li key={error} className="!text-rose-700">
                - {error}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex w-fit items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {editingRecordId ? '更新する' : '保存する'}
          </button>

          {editingRecordId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              編集をキャンセル
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-4">
        <h3 className="text-lg font-semibold text-slate-900">記録一覧</h3>
        <p className="mt-1 text-sm text-slate-600">
          表示: {filteredRecords.length}件 / 合計: {records.length}件 / {totalMinutes}分
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">今週</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {periodSummary.weeklyCount}件 / {periodSummary.weeklyMinutes}分
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">今月</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {periodSummary.monthlyCount}件 / {periodSummary.monthlyMinutes}分
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">集計表示</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                対象期間: {summaryRange === 'last7days' ? '直近7日' : '当月累計'}
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setSummaryRange('last7days')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  summaryRange === 'last7days'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                直近7日
              </button>
              <button
                type="button"
                onClick={() => setSummaryRange('monthToDate')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  summaryRange === 'monthToDate'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                当月累計
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              件数: <span className="font-semibold text-slate-900">{rangeSummary.count}件</span>
            </p>
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              学習時間: <span className="font-semibold text-slate-900">{rangeSummary.minutes}分</span>
            </p>
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              平均: <span className="font-semibold text-slate-900">{rangeSummary.count === 0 ? 0 : Math.round(rangeSummary.minutes / rangeSummary.count)}分/件</span>
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {categoryBars.map((bar) => (
              <div key={bar.category} className="grid grid-cols-[110px_1fr_48px] items-center gap-2">
                <p className="text-xs text-slate-700">{bar.label}</p>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-[width]"
                    style={{ width: `${bar.widthPercent}%` }}
                  />
                </div>
                <p className="text-right text-xs text-slate-700">{bar.minutes}分</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium !text-slate-800">
            <span className="!text-slate-900">検索</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="タイトル・メモで検索"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium !text-slate-800">
            <span className="!text-slate-900">絞り込みカテゴリ</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | LearningCategory)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring"
            >
              <option value="all">すべて</option>
              {(Object.keys(categoryLabels) as LearningCategory[]).map((key) => (
                <option key={key} value={key}>
                  {categoryLabels[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="mt-4 space-y-3">
          {filteredRecords.map((record) => (
            <li key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">{record.title}</p>
              <p className="text-sm text-slate-600">
                {record.date} / {record.minutes}分 / {categoryLabels[record.category]}
              </p>
              {record.note && <p className="mt-1 text-sm !text-slate-900">{record.note}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(record)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(record.id)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
          {records.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              まだ記録がありません。
            </li>
          )}

          {records.length > 0 && filteredRecords.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              条件に一致する記録がありません。
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};
