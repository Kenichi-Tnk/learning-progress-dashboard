import { describe, expect, it } from 'vitest';
import { validateLearningRecordInput } from './learning-record-validation';
import type { LearningRecordInput } from '@/src/types/learning-record';

describe('validateLearningRecordInput', () => {
  const validInput: LearningRecordInput = {
    date: '2026-06-30',
    title: 'React Hooks Review',
    minutes: 60,
    category: 'frontend',
    note: 'Learned about useCallback and useMemo.',
  };

  it('valid input should return no errors', () => {
    const errors = validateLearningRecordInput(validInput);
    expect(errors).toHaveLength(0);
  });

  it('missing date should return error', () => {
    const input = { ...validInput, date: '' };
    const errors = validateLearningRecordInput(input);
    expect(errors).toContain('日付は必須です。');
  });

  it('title with less than 2 characters should return error', () => {
    const input = { ...validInput, title: 'a' };
    const errors = validateLearningRecordInput(input);
    expect(errors).toContain('タイトルは2文字以上で入力してください。');
  });

  it('title with exactly 2 characters should be valid', () => {
    const input = { ...validInput, title: 'ab' };
    const errors = validateLearningRecordInput(input);
    expect(errors).not.toContain('タイトルは2文字以上で入力してください。');
  });

  it('zero or negative minutes should return error', () => {
    let input = { ...validInput, minutes: 0 };
    let errors = validateLearningRecordInput(input);
    expect(errors).toContain('学習時間は1以上で入力してください。');

    input = { ...validInput, minutes: -10 };
    errors = validateLearningRecordInput(input);
    expect(errors).toContain('学習時間は1以上で入力してください。');
  });

  it('positive minutes should be valid', () => {
    const input = { ...validInput, minutes: 1 };
    const errors = validateLearningRecordInput(input);
    expect(errors).not.toContain('学習時間は1以上で入力してください。');
  });

  it('note exceeding 500 characters should return error', () => {
    const longNote = 'a'.repeat(501);
    const input = { ...validInput, note: longNote };
    const errors = validateLearningRecordInput(input);
    expect(errors).toContain('メモは500文字以内で入力してください。');
  });

  it('note with exactly 500 characters should be valid', () => {
    const note = 'a'.repeat(500);
    const input = { ...validInput, note };
    const errors = validateLearningRecordInput(input);
    expect(errors).not.toContain('メモは500文字以内で入力してください。');
  });

  it('multiple validation errors should return all errors', () => {
    const input: LearningRecordInput = {
      date: '',
      title: 'a',
      minutes: 0,
      category: 'frontend',
      note: 'a'.repeat(501),
    };
    const errors = validateLearningRecordInput(input);
    expect(errors).toHaveLength(4);
    expect(errors).toContain('日付は必須です。');
    expect(errors).toContain('タイトルは2文字以上で入力してください。');
    expect(errors).toContain('学習時間は1以上で入力してください。');
    expect(errors).toContain('メモは500文字以内で入力してください。');
  });
});
