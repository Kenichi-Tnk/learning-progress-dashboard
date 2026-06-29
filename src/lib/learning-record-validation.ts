import type { LearningRecordInput } from '@/src/types/learning-record';

export const validateLearningRecordInput = (input: LearningRecordInput): string[] => {
  const errors: string[] = [];

  if (!input.date) {
    errors.push('Date is required.');
  }

  if (input.title.trim().length < 2) {
    errors.push('Title must be at least 2 characters.');
  }

  if (!Number.isFinite(input.minutes) || input.minutes <= 0) {
    errors.push('Minutes must be greater than 0.');
  }

  if (input.note.length > 500) {
    errors.push('Note must be 500 characters or less.');
  }

  return errors;
};
