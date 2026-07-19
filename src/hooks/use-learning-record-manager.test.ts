import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryLearningRecordAPI } from '@/src/services/learning-record-api';
import type { LearningRecord } from '@/src/types/learning-record';
import { useLearningRecordManager } from './use-learning-record-manager';

const createSubmitEvent = () =>
  ({
    preventDefault: vi.fn(),
  }) as unknown as React.FormEvent<HTMLFormElement>;

describe('useLearningRecordManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期表示時に API から記録を読み込むこと', async () => {
    const loadedRecords: LearningRecord[] = [
      {
        id: 'loaded-1',
        createdAt: '2026-07-10T10:00:00.000Z',
        date: '2026-07-10',
        title: '読み込み済み記録',
        minutes: 40,
        category: 'frontend',
        note: '初期データ',
      },
    ];

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'getAll').mockResolvedValue(loadedRecords);

    const { result } = renderHook(() => useLearningRecordManager());

    await waitFor(() => {
      expect(result.current.records).toEqual(loadedRecords);
    });
  });

  it('不正な入力では保存せずエラーを保持すること', async () => {
    const addSpy = vi.spyOn(InMemoryLearningRecordAPI.prototype, 'add');
    const { result } = renderHook(() => useLearningRecordManager());

    await waitFor(() => {
      expect(result.current.records).toEqual([]);
    });

    await act(async () => {
      result.current.setForm({
        date: '',
        title: 'a',
        minutes: 0,
        category: 'frontend',
        note: '',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    expect(addSpy).not.toHaveBeenCalled();
    expect(result.current.errors).toContain('日付は必須です。');
    expect(result.current.errors).toContain('タイトルは2文字以上で入力してください。');
    expect(result.current.errors).toContain('学習時間は1以上で入力してください。');
  });

  it('記録を追加すると一覧先頭に入り、フォームが初期化されること', async () => {
    const { result } = renderHook(() => useLearningRecordManager());

    await waitFor(() => {
      expect(result.current.records).toEqual([]);
    });

    await act(async () => {
      result.current.setForm({
        date: '2026-07-17',
        title: '新規追加',
        minutes: 50,
        category: 'backend',
        note: '追加テスト',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    await waitFor(() => {
      expect(result.current.records).toHaveLength(1);
    });

    expect(result.current.records[0]).toMatchObject({
      title: '新規追加',
      minutes: 50,
      category: 'backend',
    });
    expect(result.current.form).toEqual({
      date: '',
      title: '',
      minutes: 30,
      category: 'frontend',
      note: '',
    });
    expect(result.current.errors).toEqual([]);
  });

  it('編集開始とキャンセルでフォーム状態を切り替えられること', async () => {
    const loadedRecord: LearningRecord = {
      id: 'edit-1',
      createdAt: '2026-07-10T10:00:00.000Z',
      date: '2026-07-10',
      title: '編集対象',
      minutes: 30,
      category: 'algorithm',
      note: '編集前',
    };

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'getAll').mockResolvedValue([loadedRecord]);

    const { result } = renderHook(() => useLearningRecordManager());

    await waitFor(() => {
      expect(result.current.records).toHaveLength(1);
    });

    act(() => {
      result.current.handleEdit(loadedRecord);
    });

    expect(result.current.editingRecordId).toBe('edit-1');
    expect(result.current.form).toEqual({
      date: '2026-07-10',
      title: '編集対象',
      minutes: 30,
      category: 'algorithm',
      note: '編集前',
    });

    act(() => {
      result.current.handleCancelEdit();
    });

    expect(result.current.editingRecordId).toBeNull();
    expect(result.current.form).toEqual({
      date: '',
      title: '',
      minutes: 30,
      category: 'frontend',
      note: '',
    });
  });

  it('編集中の記録を更新すると同じ id の内容だけが置き換わること', async () => {
    const loadedRecord: LearningRecord = {
      id: 'edit-2',
      createdAt: '2026-07-10T10:00:00.000Z',
      date: '2026-07-10',
      title: '更新前タイトル',
      minutes: 30,
      category: 'frontend',
      note: '更新前メモ',
    };

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'getAll').mockResolvedValue([loadedRecord]);
    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'update').mockImplementation(async (id, input) => ({
      id,
      createdAt: loadedRecord.createdAt,
      ...input,
    }));

    const { result } = renderHook(() => useLearningRecordManager());

    await waitFor(() => {
      expect(result.current.records).toHaveLength(1);
    });

    act(() => {
      result.current.handleEdit(loadedRecord);
    });

    await act(async () => {
      result.current.setForm({
        date: '2026-07-11',
        title: '更新後タイトル',
        minutes: 90,
        category: 'infra',
        note: '更新後メモ',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent());
    });

    await waitFor(() => {
      expect(result.current.records[0]).toMatchObject({
        id: 'edit-2',
        createdAt: '2026-07-10T10:00:00.000Z',
        date: '2026-07-11',
        title: '更新後タイトル',
        minutes: 90,
        category: 'infra',
        note: '更新後メモ',
      });
    });

    expect(result.current.editingRecordId).toBeNull();
  });

  it('編集中の記録を削除すると編集状態も初期化されること', async () => {
    const loadedRecord: LearningRecord = {
      id: 'delete-1',
      createdAt: '2026-07-10T10:00:00.000Z',
      date: '2026-07-10',
      title: '削除対象',
      minutes: 20,
      category: 'other',
      note: '削除前',
    };

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'getAll').mockResolvedValue([loadedRecord]);

    const { result } = renderHook(() => useLearningRecordManager());

    await waitFor(() => {
      expect(result.current.records).toHaveLength(1);
    });

    act(() => {
      result.current.handleEdit(loadedRecord);
    });

    await act(async () => {
      await result.current.handleDelete('delete-1');
    });

    await waitFor(() => {
      expect(result.current.records).toEqual([]);
    });

    expect(result.current.editingRecordId).toBeNull();
    expect(result.current.form).toEqual({
      date: '',
      title: '',
      minutes: 30,
      category: 'frontend',
      note: '',
    });
  });
});
