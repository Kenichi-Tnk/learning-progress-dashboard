import { describe, expect, it } from 'vitest';
import {
  calculateCategoryBars,
  calculateDailyTrendBars,
  calculatePeriodSummary,
  calculateRangeSummary,
  filterLearningRecords,
} from './learning-record-analytics';
import type { LearningRecord } from '@/src/types/learning-record';

const baseRecords: LearningRecord[] = [
  {
    id: '1',
    createdAt: '2026-07-10T10:00:00.000Z',
    date: '2026-07-10',
    title: 'React Hooks',
    minutes: 60,
    category: 'frontend',
    note: 'useEffect を復習',
  },
  {
    id: '2',
    createdAt: '2026-07-09T10:00:00.000Z',
    date: '2026-07-09',
    title: 'Laravel API',
    minutes: 45,
    category: 'backend',
    note: '認証処理の確認',
  },
  {
    id: '3',
    createdAt: '2026-07-01T10:00:00.000Z',
    date: '2026-07-01',
    title: 'Algorithm Drill',
    minutes: 30,
    category: 'algorithm',
    note: '二分探索',
  },
  {
    id: '4',
    createdAt: '2026-06-30T10:00:00.000Z',
    date: '2026-06-30',
    title: 'Terraform Basics',
    minutes: 20,
    category: 'infra',
    note: '先月の記録',
  },
  {
    id: '5',
    createdAt: '2026-07-08T10:00:00.000Z',
    date: 'invalid-date',
    title: 'Broken Record',
    minutes: 99,
    category: 'other',
    note: '無効日付',
  },
];

describe('learning-record-analytics', () => {
  describe('filterLearningRecords', () => {
    it('カテゴリと検索語の両方で絞り込めること', () => {
      const result = filterLearningRecords(baseRecords, 'frontend', 'react');

      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe('React Hooks');
    });

    it('検索語は前後空白を無視して title と note の両方を対象にすること', () => {
      const byTitle = filterLearningRecords(baseRecords, 'all', '  laravel  ');
      const byNote = filterLearningRecords(baseRecords, 'all', '認証処理');

      expect(byTitle).toHaveLength(1);
      expect(byTitle[0]?.title).toBe('Laravel API');
      expect(byNote).toHaveLength(1);
      expect(byNote[0]?.title).toBe('Laravel API');
    });
  });

  describe('calculatePeriodSummary', () => {
    it('週次は月曜始まり、月次は当月のみを集計し、無効日付は除外すること', () => {
      const now = new Date('2026-07-10T12:00:00');

      const result = calculatePeriodSummary(baseRecords, now);

      expect(result).toEqual({
        weeklyCount: 2,
        weeklyMinutes: 105,
        monthlyCount: 3,
        monthlyMinutes: 135,
      });
    });
  });

  describe('calculateRangeSummary', () => {
    it('直近7日は当日を含む 7 日間だけをカテゴリ別に集計すること', () => {
      const now = new Date('2026-07-10T12:00:00');

      const result = calculateRangeSummary(baseRecords, 'last7days', now);

      expect(result).toEqual({
        count: 2,
        minutes: 105,
        categoryMinutes: {
          frontend: 60,
          backend: 45,
          algorithm: 0,
          infra: 0,
          other: 0,
        },
      });
    });

    it('当月累計は月初以降のみを集計すること', () => {
      const now = new Date('2026-07-10T12:00:00');

      const result = calculateRangeSummary(baseRecords, 'monthToDate', now);

      expect(result.count).toBe(3);
      expect(result.minutes).toBe(135);
      expect(result.categoryMinutes.infra).toBe(0);
    });
  });

  describe('calculateCategoryBars', () => {
    it('最大値を 100% として各カテゴリの幅を計算すること', () => {
      const result = calculateCategoryBars({
        count: 3,
        minutes: 135,
        categoryMinutes: {
          frontend: 60,
          backend: 45,
          algorithm: 30,
          infra: 0,
          other: 0,
        },
      });

      expect(result).toHaveLength(5);
      expect(result[0]).toMatchObject({
        category: 'frontend',
        minutes: 60,
        widthPercent: 100,
      });
      expect(result[1]).toMatchObject({
        category: 'backend',
        minutes: 45,
        widthPercent: 75,
      });
      expect(result[3]).toMatchObject({
        category: 'infra',
        minutes: 0,
        widthPercent: 0,
      });
    });
  });

  describe('calculateDailyTrendBars', () => {
    it('直近7日分を日別に並べ、範囲外と無効日付を除外すること', () => {
      const now = new Date('2026-07-10T12:00:00');

      const result = calculateDailyTrendBars(baseRecords, now);

      expect(result).toHaveLength(7);
      expect(result.map((bar) => bar.key)).toEqual([
        '2026-07-04',
        '2026-07-05',
        '2026-07-06',
        '2026-07-07',
        '2026-07-08',
        '2026-07-09',
        '2026-07-10',
      ]);
      expect(result[4]).toMatchObject({ key: '2026-07-08', minutes: 0, widthPercent: 0 });
      expect(result[5]).toMatchObject({ key: '2026-07-09', minutes: 45, widthPercent: 75 });
      expect(result[6]).toMatchObject({ key: '2026-07-10', minutes: 60, widthPercent: 100 });
    });
  });
});