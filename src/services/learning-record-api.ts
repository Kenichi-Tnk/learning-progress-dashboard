import type { LearningRecord, LearningRecordInput } from '@/src/types/learning-record';

export type LearningRecordAPIMode = 'memory' | 'http';

const DEFAULT_API_ORIGIN = process.env.NEXT_PUBLIC_LARAVEL_API_ORIGIN ?? 'http://localhost';
const DEFAULT_API_BASE_URL = `${DEFAULT_API_ORIGIN}/api/learning-progresses`;
const DEFAULT_HEALTH_URL = `${DEFAULT_API_ORIGIN}/api/health`;
const MEMO_MINUTES_PATTERN = /^\[minutes:(\d+)\](.*)$/s;
const DEFAULT_STATUS = 'in_progress';

type LaravelLearningProgress = {
  id: number | string;
  title: string;
  category: string | null;
  status: string;
  memo: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type LaravelLearningProgressPayload = {
  title: string;
  category: string;
  status: string;
  memo: string;
  started_at: string | null;
};

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
  healthUrl?: string;
  fetchFn?: typeof fetch;
};

export type CreateLearningRecordAPIOptions = {
  mode?: LearningRecordAPIMode;
  baseUrl?: string;
  healthUrl?: string;
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
  private readonly healthUrl: string;
  private readonly fetchFn: typeof fetch;
  private isHealthChecked = false;

  constructor(options: HttpLearningRecordAPIOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
    this.healthUrl = options.healthUrl ?? DEFAULT_HEALTH_URL;
    this.fetchFn = options.fetchFn ?? ((input, init) => globalThis.fetch(input, init));
  }

  private encodeMemo(note: string, minutes: number): string {
    return `[minutes:${minutes}]${note}`;
  }

  private decodeMemo(memo: string | null): { minutes: number; note: string } {
    if (!memo) {
      return { minutes: 0, note: '' };
    }

    const matched = memo.match(MEMO_MINUTES_PATTERN);
    if (!matched) {
      return { minutes: 0, note: memo };
    }

    return {
      minutes: Number(matched[1]),
      note: matched[2],
    };
  }

  private normalizeCategory(category: string | null): LearningRecord['category'] {
    switch (category) {
      case 'frontend':
      case 'backend':
      case 'algorithm':
      case 'infra':
      case 'other':
        return category;
      default:
        return 'other';
    }
  }

  private toBackendPayload(input: LearningRecordInput): LaravelLearningProgressPayload {
    return {
      title: input.title,
      category: input.category,
      status: DEFAULT_STATUS,
      memo: this.encodeMemo(input.note, input.minutes),
      started_at: input.date ? `${input.date} 00:00:00` : null,
    };
  }

  private toLearningRecord(progress: LaravelLearningProgress): LearningRecord {
    const { minutes, note } = this.decodeMemo(progress.memo);
    const fallbackDate = progress.created_at ? progress.created_at.slice(0, 10) : '';

    return {
      id: String(progress.id),
      createdAt: progress.created_at,
      date: progress.started_at ? progress.started_at.slice(0, 10) : fallbackDate,
      title: progress.title,
      minutes,
      category: this.normalizeCategory(progress.category),
      note,
    };
  }

  private async ensureHealth(): Promise<void> {
    if (this.isHealthChecked) {
      return;
    }

    const response = await this.fetchFn(this.healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    this.isHealthChecked = true;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await this.fetchFn(url, {
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
    const payload = this.toBackendPayload(input);

    const response = await this.request<LaravelLearningProgress>('', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return this.toLearningRecord(response);
  }

  async getAll(): Promise<LearningRecord[]> {
    await this.ensureHealth();

    const response = await this.request<LaravelLearningProgress[]>('', {
      method: 'GET',
    });

    return response.map((progress) => this.toLearningRecord(progress));
  }

  async update(id: string, input: LearningRecordInput): Promise<LearningRecord> {
    const payload = this.toBackendPayload(input);

    const response = await this.request<LaravelLearningProgress>(`/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return this.toLearningRecord(response);
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
      healthUrl: options.healthUrl,
      fetchFn: options.fetchFn,
    });
  }

  return new InMemoryLearningRecordAPI();
};
