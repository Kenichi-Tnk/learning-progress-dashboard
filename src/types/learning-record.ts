export type LearningCategory = 'frontend' | 'backend' | 'algorithm' | 'infra' | 'other';

export interface LearningRecordInput {
  date: string;
  title: string;
  minutes: number;
  category: LearningCategory;
  note: string;
}

export interface LearningRecord extends LearningRecordInput {
  id: string;
  createdAt: string;
}
