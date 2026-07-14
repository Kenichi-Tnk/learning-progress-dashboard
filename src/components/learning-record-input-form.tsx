import type { FormEvent } from 'react';
import { categoryLabels } from '@/src/lib/learning-record-analytics';
import type { LearningCategory, LearningRecordInput } from '@/src/types/learning-record';

type LearningRecordInputFormProps = {
  form: LearningRecordInput;
  errors: string[];
  editingRecordId: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (nextForm: LearningRecordInput) => void;
  onCancelEdit: () => void;
};

export const LearningRecordInputForm = ({
  form,
  errors,
  editingRecordId,
  onSubmit,
  onFormChange,
  onCancelEdit,
}: LearningRecordInputFormProps) => {
  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm font-medium !text-slate-800">
        <span className="!text-slate-900">日付</span>
        <input
          type="date"
          value={form.date}
          onChange={(e) => onFormChange({ ...form, date: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium !text-slate-800">
        <span className="!text-slate-900">タイトル</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onFormChange({ ...form, title: e.target.value })}
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
              onFormChange({
                ...form,
                minutes: Number(e.target.value || 0),
              })
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">カテゴリ</span>
          <select
            value={form.category}
            onChange={(e) => onFormChange({ ...form, category: e.target.value as LearningCategory })}
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
          onChange={(e) => onFormChange({ ...form, note: e.target.value })}
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
            onClick={onCancelEdit}
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            編集をキャンセル
          </button>
        )}
      </div>
    </form>
  );
};