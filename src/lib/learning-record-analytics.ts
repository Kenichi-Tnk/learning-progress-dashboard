import type {
  LearningCategory,
  LearningRecord,
  LearningRecordInput,
} from '@/src/types/learning-record';

export type SummaryRange = 'last7days' | 'monthToDate';

export type ChartDetail = {
  label: string;
  minutes: number;
  type: 'category' | 'daily';
};

export type PeriodSummary = {
  weeklyCount: number;
  weeklyMinutes: number;
  monthlyCount: number;
  monthlyMinutes: number;
};

export type RangeSummary = {
  count: number;
  minutes: number;
  categoryMinutes: Record<LearningCategory, number>;
};

export type CategoryBar = {
  category: LearningCategory;
  label: string;
  minutes: number;
  widthPercent: number;
};

export type DailyTrendBar = {
  key: string;
  label: string;
  minutes: number;
  widthPercent: number;
};

export const categoryLabels: Record<LearningCategory, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  algorithm: 'アルゴリズム',
  infra: 'インフラ',
  other: 'その他',
};

const formatLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const initialForm: LearningRecordInput = {
  date: '',
  title: '',
  minutes: 30,
  category: 'frontend',
  note: '',
};

export const filterLearningRecords = (
  records: LearningRecord[],
  filterCategory: 'all' | LearningCategory,
  searchTerm: string
): LearningRecord[] => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return records.filter((record) => {
    const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      record.title.toLowerCase().includes(normalizedSearch) ||
      record.note.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
};

export const calculatePeriodSummary = (
  records: LearningRecord[],
  now = new Date()
): PeriodSummary => {
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);

  const initial: PeriodSummary = {
    weeklyCount: 0,
    weeklyMinutes: 0,
    monthlyCount: 0,
    monthlyMinutes: 0,
  };

  return records.reduce((acc, record) => {
    const recordDate = new Date(`${record.date}T00:00:00`);
    if (Number.isNaN(recordDate.getTime())) {
      return acc;
    }

    if (recordDate >= weekStart && recordDate <= todayEnd) {
      acc.weeklyCount += 1;
      acc.weeklyMinutes += record.minutes;
    }

    if (recordDate >= monthStart && recordDate <= todayEnd) {
      acc.monthlyCount += 1;
      acc.monthlyMinutes += record.minutes;
    }

    return acc;
  }, initial);
};

export const calculateRangeSummary = (
  records: LearningRecord[],
  summaryRange: SummaryRange,
  now = new Date()
): RangeSummary => {
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const rangeStart = summaryRange === 'last7days' ? sevenDaysStart : monthStart;

  const categoryMinutes: Record<LearningCategory, number> = {
    frontend: 0,
    backend: 0,
    algorithm: 0,
    infra: 0,
    other: 0,
  };

  return records.reduce(
    (acc, record) => {
      const recordDate = new Date(`${record.date}T00:00:00`);
      if (Number.isNaN(recordDate.getTime())) {
        return acc;
      }

      if (recordDate < rangeStart || recordDate > todayEnd) {
        return acc;
      }

      acc.count += 1;
      acc.minutes += record.minutes;
      acc.categoryMinutes[record.category] += record.minutes;
      return acc;
    },
    {
      count: 0,
      minutes: 0,
      categoryMinutes,
    }
  );
};

export const calculateCategoryBars = (rangeSummary: RangeSummary): CategoryBar[] => {
  const entries = (Object.keys(categoryLabels) as LearningCategory[]).map((category) => ({
    category,
    label: categoryLabels[category],
    minutes: rangeSummary.categoryMinutes[category],
  }));

  const maxMinutes = Math.max(...entries.map((entry) => entry.minutes), 0);

  return entries.map((entry) => ({
    ...entry,
    widthPercent: maxMinutes === 0 ? 0 : Math.round((entry.minutes / maxMinutes) * 100),
  }));
};

export const calculateDailyTrendBars = (
  records: LearningRecord[],
  now = new Date()
): DailyTrendBar[] => {
  const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const key = formatLocalDateKey(date);
    return {
      key,
      label: `${date.getMonth() + 1}/${date.getDate()}(${weekdayLabels[date.getDay()]})`,
      minutes: 0,
    };
  });

  const totalsByDay = new Map(days.map((day) => [day.key, 0]));

  records.forEach((record) => {
    const date = new Date(`${record.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = formatLocalDateKey(date);
    if (!totalsByDay.has(key)) {
      return;
    }

    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + record.minutes);
  });

  const filledBars = days.map((day) => ({
    ...day,
    minutes: totalsByDay.get(day.key) ?? 0,
  }));

  const maxMinutes = Math.max(...filledBars.map((bar) => bar.minutes), 0);

  return filledBars.map((bar) => ({
    ...bar,
    widthPercent: maxMinutes === 0 ? 0 : Math.round((bar.minutes / maxMinutes) * 100),
  }));
};
