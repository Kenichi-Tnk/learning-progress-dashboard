'use client';

import { FormEvent, useMemo, useState } from 'react';
import { validateLearningRecordInput } from '@/src/lib/learning-record-validation';
import type {
  LearningCategory,
  LearningRecord,
  LearningRecordInput,
} from '@/src/types/learning-record';

const categoryLabels: Record<LearningCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  algorithm: 'Algorithm',
  infra: 'Infrastructure',
  other: 'Other',
};

const initialForm: LearningRecordInput = {
  date: '',
  title: '',
  minutes: 30,
  category: 'frontend',
  note: '',
};

export const LearningRecordForm = () => {
  const [form, setForm] = useState<LearningRecordInput>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [records, setRecords] = useState<LearningRecord[]>([]);

  const totalMinutes = useMemo(
    () => records.reduce((sum, record) => sum + record.minutes, 0),
    [records]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateLearningRecordInput(form);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newRecord: LearningRecord = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setErrors([]);
    setForm(initialForm);
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Learning Record Form</h2>
      <p className="mt-1 text-sm text-slate-600">
        Start with typed input and build features incrementally.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Title
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: React hooks review"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Minutes
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
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Category
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  category: e.target.value as LearningCategory,
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-200 focus:ring"
            >
              {(Object.keys(categoryLabels) as LearningCategory[]).map((key) => (
                <option key={key} value={key}>
                  {categoryLabels[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Note
          <textarea
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            rows={4}
            maxLength={500}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>

        {errors.length > 0 && (
          <ul className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errors.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className="inline-flex w-fit items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Save Record
        </button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-4">
        <h3 className="text-lg font-semibold text-slate-900">Recent Records</h3>
        <p className="mt-1 text-sm text-slate-600">
          Total: {records.length} records / {totalMinutes} minutes
        </p>

        <ul className="mt-4 space-y-3">
          {records.map((record) => (
            <li key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">{record.title}</p>
              <p className="text-sm text-slate-600">
                {record.date} / {record.minutes} min / {categoryLabels[record.category]}
              </p>
              {record.note && <p className="mt-1 text-sm text-slate-700">{record.note}</p>}
            </li>
          ))}
          {records.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              No records yet.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};
