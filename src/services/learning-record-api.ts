import type { LearningRecord, LearningRecordInput } from '@/src/types/learning-record';

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
