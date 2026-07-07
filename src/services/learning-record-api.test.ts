import { describe, expect, it, beforeEach } from 'vitest';
import { InMemoryLearningRecordAPI } from './learning-record-api';
import type { LearningRecordInput } from '@/src/types/learning-record';

describe('InMemoryLearningRecordAPI', () => {
  let api: InMemoryLearningRecordAPI;

  const validInput: LearningRecordInput = {
    date: '2026-07-01',
    title: 'React Hooks',
    minutes: 60,
    category: 'frontend',
    note: 'Learned about useCallback.',
  };

  beforeEach(() => {
    api = new InMemoryLearningRecordAPI();
  });

  describe('add', () => {
    it('should add a new record and return it with id and createdAt', async () => {
      const result = await api.add(validInput);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result.date).toBe(validInput.date);
      expect(result.title).toBe(validInput.title);
      expect(result.minutes).toBe(validInput.minutes);
      expect(result.category).toBe(validInput.category);
      expect(result.note).toBe(validInput.note);
    });

    it('should assign unique ids to different records', async () => {
      const result1 = await api.add(validInput);
      const result2 = await api.add(validInput);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getAll', () => {
    it('should return empty array initially', async () => {
      const result = await api.getAll();

      expect(result).toHaveLength(0);
    });

    it('should return all added records', async () => {
      await api.add(validInput);
      await api.add(validInput);
      await api.add(validInput);

      const result = await api.getAll();
      expect(result).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const added = await api.add(validInput);

      const updatedInput: LearningRecordInput = {
        date: '2026-07-02',
        title: 'Updated Title',
        minutes: 90,
        category: 'backend',
        note: 'Updated note.',
      };

      const updated = await api.update(added.id, updatedInput);

      expect(updated.id).toBe(added.id);
      expect(updated.createdAt).toBe(added.createdAt);
      expect(updated.date).toBe(updatedInput.date);
      expect(updated.title).toBe(updatedInput.title);
      expect(updated.minutes).toBe(updatedInput.minutes);
      expect(updated.category).toBe(updatedInput.category);
      expect(updated.note).toBe(updatedInput.note);
    });

    it('should throw error if record not found', async () => {
      const fakeId = `non-existent-id`;

      await expect(api.update(fakeId, validInput)).rejects.toThrow();
    });

    it('should not change id and createdAt on update', async () => {
      const added = await api.add(validInput);
      const originalId = added.id;
      const originalCreatedAt = added.createdAt;

      const updatedInput: LearningRecordInput = {
        date: '2026-07-03',
        title: 'Different Title',
        minutes: 120,
        category: 'algorithm',
        note: 'Different note.',
      };
      const updated = await api.update(added.id, updatedInput);

      expect(updated.id).toBe(originalId);
      expect(updated.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('delete', () => {
    it('should delete a record by id', async () => {
      const added = await api.add(validInput);

      await api.delete(added.id);

      const result = await api.getAll();

      expect(result).toHaveLength(0);
    });

    it('should not throw error if record not found', async () => {
      const fakeId = 'non-existent-id';
      await api.delete(fakeId);

      const result = await api.getAll();
      expect(result).toHaveLength(0);
    });
  });
});
