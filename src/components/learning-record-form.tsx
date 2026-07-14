'use client';

import { useMemo, useState } from 'react';
import { LearningRecordInputForm } from '@/src/components/learning-record-input-form';
import { LearningRecordListSection } from '@/src/components/learning-record-list-section';
import { useLearningRecordManager } from '@/src/hooks/use-learning-record-manager';
import {
  calculateCategoryBars,
  calculateDailyTrendBars,
  calculatePeriodSummary,
  calculateRangeSummary,
  filterLearningRecords,
  type ChartDetail,
  type SummaryRange,
} from '@/src/lib/learning-record-analytics';
import type { LearningCategory } from '@/src/types/learning-record';

export const LearningRecordForm = () => {
  const {
    form,
    setForm,
    errors,
    records,
    editingRecordId,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancelEdit,
  } = useLearningRecordManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | LearningCategory>('all');
  const [summaryRange, setSummaryRange] = useState<SummaryRange>('last7days');
  const [chartDetail, setChartDetail] = useState<ChartDetail | null>(null);

  const totalMinutes = useMemo(
    () => records.reduce((sum, record) => sum + record.minutes, 0),
    [records]
  );

  const filteredRecords = useMemo(
    () => filterLearningRecords(records, filterCategory, searchTerm),
    [records, filterCategory, searchTerm]
  );

  const periodSummary = useMemo(() => calculatePeriodSummary(records), [records]);

  const rangeSummary = useMemo(
    () => calculateRangeSummary(records, summaryRange),
    [records, summaryRange]
  );

  const categoryBars = useMemo(() => calculateCategoryBars(rangeSummary), [rangeSummary]);

  const dailyTrendBars = useMemo(() => calculateDailyTrendBars(records), [records]);


  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">学習記録フォーム</h2>
      <p className="mt-1 text-sm text-slate-600">
        学習内容を記録して、進捗を少しずつ積み上げましょう。
      </p>

      <LearningRecordInputForm
        form={form}
        errors={errors}
        editingRecordId={editingRecordId}
        onSubmit={handleSubmit}
        onFormChange={setForm}
        onCancelEdit={handleCancelEdit}
      />

      <LearningRecordListSection
        filteredRecords={filteredRecords}
        totalRecordsCount={records.length}
        totalMinutes={totalMinutes}
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        periodSummary={periodSummary}
        summaryRange={summaryRange}
        rangeSummary={rangeSummary}
        categoryBars={categoryBars}
        dailyTrendBars={dailyTrendBars}
        chartDetail={chartDetail}
        onSearchTermChange={setSearchTerm}
        onFilterCategoryChange={setFilterCategory}
        onSummaryRangeChange={setSummaryRange}
        onChartDetailChange={setChartDetail}
        onEdit={handleEdit}
        onDelete={(id) => void handleDelete(id)}
      />
    </section>
  );
};
