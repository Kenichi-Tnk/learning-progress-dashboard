import { describe, expect, it, vi } from 'vitest';
import {
  HttpLearningRecordAPI,
  InMemoryLearningRecordAPI,
  createLearningRecordAPI,
  resolveLearningRecordApiMode,
} from './learning-record-api';
import type { LearningRecord, LearningRecordInput } from '@/src/types/learning-record';

describe('learning-record-api factory and http adapter', () => {
  it('resolveLearningRecordApiMode は未指定や不正値で memory を返すこと', () => {
    expect(resolveLearningRecordApiMode()).toBe('memory');
    expect(resolveLearningRecordApiMode('invalid')).toBe('memory');
    expect(resolveLearningRecordApiMode('memory')).toBe('memory');
    expect(resolveLearningRecordApiMode('http')).toBe('http');
  });

  it('createLearningRecordAPI は mode=memory で InMemory を返すこと', () => {
    const api = createLearningRecordAPI({ mode: 'memory' });
    expect(api).toBeInstanceOf(InMemoryLearningRecordAPI);
  });

  it('createLearningRecordAPI は mode=http で Http を返すこと', () => {
    const api = createLearningRecordAPI({ mode: 'http' });
    expect(api).toBeInstanceOf(HttpLearningRecordAPI);
  });

  it('HttpLearningRecordAPI は CRUD リクエストを正しいメソッドとURLで呼ぶこと', async () => {
    const sampleInput: LearningRecordInput = {
      date: '2026-07-20',
      title: 'HTTP API test',
      minutes: 30,
      category: 'frontend',
      note: 'adapter test',
    };

    const sampleRecord: LearningRecord = {
      id: 'r-1',
      createdAt: '2026-07-20T10:00:00.000Z',
      ...sampleInput,
    };

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([sampleRecord]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleRecord), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...sampleRecord, title: 'updated' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const api = new HttpLearningRecordAPI({
      baseUrl: 'http://localhost:8080/api/learning-records',
      fetchFn: fetchMock,
    });

    await expect(api.getAll()).resolves.toHaveLength(1);
    await expect(api.add(sampleInput)).resolves.toMatchObject({ id: 'r-1' });
    await expect(api.update('r-1', sampleInput)).resolves.toMatchObject({ title: 'updated' });
    await expect(api.delete('r-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8080/api/learning-records',
      expect.objectContaining({ method: 'GET' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8080/api/learning-records',
      expect.objectContaining({ method: 'POST' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8080/api/learning-records/r-1',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://localhost:8080/api/learning-records/r-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('HttpLearningRecordAPI は非2xxレスポンス時にエラーを投げること', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('server error', { status: 500, statusText: 'Error' }));

    const api = new HttpLearningRecordAPI({
      baseUrl: 'http://localhost:8080/api/learning-records',
      fetchFn: fetchMock,
    });

    await expect(api.getAll()).rejects.toThrow('API request failed: 500 Error');
  });
});
