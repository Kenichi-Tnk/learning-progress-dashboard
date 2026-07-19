import type { LearningRecord, LearningRecordInput } from '@/src/types/learning-record';

export type LearningRecordAPIMode = 'memory' | 'http';

const DEFAULT_API_BASE_URL = '/api/learning-records';

export interface LearningRecordAPI {
  // 新しい学習記録を追加
  add(input: LearningRecordInput): Promise<LearningRecord>;

  // 全ての学習記録を取得
  getAll(): Promise<LearningRecord[]>;

  // 記録をIDで更新
  update(id: string, input: LearningRecordInput): Promise<LearningRecord>;

  // 記録をIDで削除
  delete(id: string): Promise<void>;
}

type HttpLearningRecordAPIOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

export type CreateLearningRecordAPIOptions = {
  mode?: LearningRecordAPIMode;
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

export const resolveLearningRecordApiMode = (
  rawMode?: string | undefined
): LearningRecordAPIMode => {
  return rawMode === 'http' ? 'http' : 'memory';
};

export class InMemoryLearningRecordAPI implements LearningRecordAPI {
  private records: LearningRecord[] = [];

  async add(input: LearningRecordInput): Promise<LearningRecord> {
    const newRecord: LearningRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.records.push(newRecord);
    return newRecord;
  }

  async getAll(): Promise<LearningRecord[]> {
    return [...this.records];
  }

  async update(id: string, input: LearningRecordInput): Promise<LearningRecord> {
    // 配列からレコードを返す
    const record = this.records.find((r) => r.id === id);

    // レコードが見つからない場合はエラーを投げる
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    // 見つかったレコードのプロパティを更新する
    // (idとcreatedAtは更新しない、他は全部inputで上書きする)
    record.date = input.date;
    record.title = input.title;
    record.minutes = input.minutes;
    record.category = input.category;
    record.note = input.note;

    return record;
  }

  async delete(id: string): Promise<void> {
    // IDに合致しないレコードだけ残す（filterを使用）
    // その結果でrecords配列を置き換える
    this.records = this.records.filter((r) => r.id !== id);
  }
}

export class HttpLearningRecordAPI implements LearningRecordAPI {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: HttpLearningRecordAPIOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async add(input: LearningRecordInput): Promise<LearningRecord> {
    return this.request<LearningRecord>('', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getAll(): Promise<LearningRecord[]> {
    return this.request<LearningRecord[]>('', {
      method: 'GET',
    });
  }

  async update(id: string, input: LearningRecordInput): Promise<LearningRecord> {
    return this.request<LearningRecord>(`/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

export const createLearningRecordAPI = (
  options: CreateLearningRecordAPIOptions = {}
): LearningRecordAPI => {
  const mode =
    options.mode ?? resolveLearningRecordApiMode(process.env.NEXT_PUBLIC_LEARNING_RECORD_API_MODE);

  if (mode === 'http') {
    return new HttpLearningRecordAPI({
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
    });
  }

  return new InMemoryLearningRecordAPI();
};
