import { FormEvent, useEffect, useState } from 'react';
import { initialForm } from '@/src/lib/learning-record-analytics';
import { validateLearningRecordInput } from '@/src/lib/learning-record-validation';
import { InMemoryLearningRecordAPI } from '@/src/services/learning-record-api';
import type { LearningRecord, LearningRecordInput } from '@/src/types/learning-record';

export const useLearningRecordManager = () => {
  const [learningRecordApi] = useState(() => new InMemoryLearningRecordAPI());
  const [form, setForm] = useState<LearningRecordInput>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      const loadedRecords = await learningRecordApi.getAll();
      setRecords(loadedRecords);
    };

    void loadRecords();
  }, [learningRecordApi]);

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

  return {
    form,
    setForm,
    errors,
    records,
    editingRecordId,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancelEdit,
  };
};