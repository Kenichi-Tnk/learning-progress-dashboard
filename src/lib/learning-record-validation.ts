import type { LearningRecordInput } from '@/src/types/learning-record';

export const validateLearningRecordInput = (input: LearningRecordInput): string[] => {
  const errors: string[] = [];

  if (!input.date) {
    errors.push('日付は必須です。');
  }

  if (input.title.trim().length < 2) {
    errors.push('タイトルは2文字以上で入力してください。');
  }

  if (!Number.isFinite(input.minutes) || input.minutes <= 0) {
    errors.push('学習時間は1以上で入力してください。');
  }

  if (input.note.length > 500) {
    errors.push('メモは500文字以内で入力してください。');
  }

  return errors;
};
