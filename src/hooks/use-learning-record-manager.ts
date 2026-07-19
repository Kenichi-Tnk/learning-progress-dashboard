import { FormEvent, useCallback, useEffect, useState } from 'react';
import { initialForm } from '@/src/lib/learning-record-analytics';
import { validateLearningRecordInput } from '@/src/lib/learning-record-validation';
import {
  createLearningRecordAPI,
  type LearningRecordAPI,
} from '@/src/services/learning-record-api';
import type { LearningRecord, LearningRecordInput } from '@/src/types/learning-record';

type RetryAction = {
  run: () => Promise<void>;
};

type SubmitState = 'idle' | 'saving' | 'updating';

export const useLearningRecordManager = (api?: LearningRecordAPI) => {
  const [learningRecordApi] = useState(() => api ?? createLearningRecordAPI());
  const [form, setForm] = useState<LearningRecordInput>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<RetryAction | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      const loadedRecords = await learningRecordApi.getAll();
      setRecords(loadedRecords);
      setApiError(null);
      setSuccessMessage(null);
      setRetryAction(null);
    } catch {
      setApiError('記録の読み込みに失敗しました。時間をおいて再度お試しください。');
      setRetryAction({ run: loadRecords });
    } finally {
      setIsInitialLoading(false);
    }
  }, [learningRecordApi]);

  const setPersistRetryAction = (
    nextForm: LearningRecordInput,
    nextEditingRecordId: string | null
  ) => {
    setRetryAction({
      run: async () => {
        try {
          await persistRecord(nextForm, nextEditingRecordId);
        } catch {
          setApiError(
            nextEditingRecordId
              ? '記録の更新に失敗しました。時間をおいて再度お試しください。'
              : '記録の保存に失敗しました。時間をおいて再度お試しください。'
          );
          setPersistRetryAction(nextForm, nextEditingRecordId);
        }
      },
    });
  };

  const setDeleteRetryAction = (id: string) => {
    setRetryAction({
      run: async () => {
        try {
          await removeRecord(id);
        } catch {
          setApiError('記録の削除に失敗しました。時間をおいて再度お試しください。');
          setDeleteRetryAction(id);
        }
      },
    });
  };

  const persistRecord = async (
    nextForm: LearningRecordInput,
    nextEditingRecordId: string | null
  ) => {
    if (nextEditingRecordId) {
      const updatedRecord = await learningRecordApi.update(nextEditingRecordId, nextForm);
      setRecords((prev) =>
        prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
      );
      setEditingRecordId(null);
    } else {
      const savedRecord = await learningRecordApi.add(nextForm);
      setRecords((prev) => [savedRecord, ...prev]);
    }

    setApiError(null);
    setRetryAction(null);
    setErrors([]);
    setForm(initialForm);
    setSuccessMessage(nextEditingRecordId ? '更新完了しました。' : '保存完了しました。');
  };

  const removeRecord = async (id: string) => {
    await learningRecordApi.delete(id);
    setRecords((prev) => prev.filter((record) => record.id !== id));
    setApiError(null);
    setRetryAction(null);
    setSuccessMessage('削除完了しました。');

    if (editingRecordId === id) {
      setEditingRecordId(null);
      setForm(initialForm);
      setErrors([]);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const handleFormChange = (nextForm: LearningRecordInput) => {
    setForm(nextForm);
    setApiError(null);
    setSuccessMessage(null);
    setRetryAction(null);
    setIsRetrying(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState !== 'idle') {
      return;
    }

    setSuccessMessage(null);

    const nextErrors = validateLearningRecordInput(form);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextSubmitState: SubmitState = editingRecordId ? 'updating' : 'saving';
    setSubmitState(nextSubmitState);

    try {
      await persistRecord(form, editingRecordId);
    } catch {
      setSuccessMessage(null);
      setApiError(
        editingRecordId
          ? '記録の更新に失敗しました。時間をおいて再度お試しください。'
          : '記録の保存に失敗しました。時間をおいて再度お試しください。'
      );
      setPersistRetryAction(form, editingRecordId);
    } finally {
      setSubmitState('idle');
    }
  };

  const handleEdit = (record: LearningRecord) => {
    handleFormChange({
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
    if (deletingRecordId) {
      return;
    }

    setSuccessMessage(null);
    setDeletingRecordId(id);

    try {
      await removeRecord(id);
    } catch {
      setSuccessMessage(null);
      setApiError('記録の削除に失敗しました。時間をおいて再度お試しください。');
      setDeleteRetryAction(id);
    } finally {
      setDeletingRecordId(null);
    }
  };

  const handleRetry = async () => {
    if (!retryAction || isRetrying) {
      return;
    }

    setIsRetrying(true);

    try {
      await retryAction.run();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setForm(initialForm);
    setErrors([]);
    setApiError(null);
    setSuccessMessage(null);
    setRetryAction(null);
    setIsRetrying(false);
  };

  return {
    form,
    setForm: handleFormChange,
    errors,
    apiError,
    successMessage,
    canRetry: retryAction !== null,
    isRetrying,
    isInitialLoading,
    isSaving: submitState === 'saving',
    isUpdating: submitState === 'updating',
    deletingRecordId,
    records,
    editingRecordId,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleRetry,
    handleCancelEdit,
  };
};
