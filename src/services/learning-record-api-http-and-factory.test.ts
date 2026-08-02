import { describe, expect, it, vi } from 'vitest';
import {
  HttpLearningRecordAPI,
  InMemoryLearningRecordAPI,
  createLearningRecordAPI,
  resolveLearningRecordApiMode,
} from './learning-record-api';
import type { LearningRecordInput } from '@/src/types/learning-record';

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

    const sampleBackendRecord = {
      id: 1,
      title: 'HTTP API test',
      category: 'frontend',
      status: 'in_progress',
      memo: '[minutes:30]adapter test',
      started_at: '2026-07-20 00:00:00',
      completed_at: null,
      created_at: '2026-07-20T10:00:00.000000Z',
      updated_at: '2026-07-20T10:00:00.000000Z',
    };

    const updatedBackendRecord = {
      ...sampleBackendRecord,
      title: 'updated',
      memo: '[minutes:30]adapter test',
    };

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([sampleBackendRecord]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleBackendRecord), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(updatedBackendRecord), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const api = new HttpLearningRecordAPI({
      baseUrl: 'http://localhost:8080/api/learning-progresses',
      healthUrl: 'http://localhost:8080/api/health',
      fetchFn: fetchMock,
    });

    await expect(api.getAll()).resolves.toEqual([
      {
        id: '1',
        createdAt: '2026-07-20T10:00:00.000000Z',
        date: '2026-07-20',
        title: 'HTTP API test',
        minutes: 30,
        category: 'frontend',
        note: 'adapter test',
      },
    ]);

    await expect(api.add(sampleInput)).resolves.toMatchObject({
      id: '1',
      minutes: 30,
      note: 'adapter test',
    });
    await expect(api.update('1', sampleInput)).resolves.toMatchObject({ title: 'updated' });
    await expect(api.delete('1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8080/api/health',
      expect.objectContaining({ method: 'GET' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8080/api/learning-progresses',
      expect.objectContaining({ method: 'GET' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8080/api/learning-progresses',
      expect.objectContaining({ method: 'POST' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://localhost:8080/api/learning-progresses/1',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      'http://localhost:8080/api/learning-progresses/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('HttpLearningRecordAPI は非2xxレスポンス時にエラーを投げること', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('server error', { status: 500, statusText: 'Error' }));

    const api = new HttpLearningRecordAPI({
      baseUrl: 'http://localhost:8080/api/learning-progresses',
      healthUrl: 'http://localhost:8080/api/health',
      fetchFn: fetchMock,
    });

    await expect(api.getAll()).rejects.toThrow('API request failed: 500 Error');
  });
});
