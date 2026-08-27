'use client';

import { useEffect, useMemo, useState } from 'react';
import { LearningRecordInputForm } from '@/src/components/learning-record-input-form';
import { LearningRecordListSection } from '@/src/components/learning-record-list-section';
import { useLearningRecordManager } from '@/src/hooks/use-learning-record-manager';
import { createLearningRecordAPI } from '@/src/services/learning-record-api';
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

type LearningRecordFormProps = {
  // NextAuthのセッションから受け取るLaravelのaccessToken
  accessToken?: string;
};

export const LearningRecordForm = ({ accessToken }: LearningRecordFormProps = {}) => {
  const learningRecordApi = useMemo(
    () => createLearningRecordAPI({ getAuthToken: () => accessToken }),
    [accessToken]
  );
  const {
    form,
    setForm,
    errors,
    apiError,
    successMessage,
    canRetry,
    isRetrying,
    isInitialLoading,
    isSaving,
    isUpdating,
    deletingRecordId,
    records,
    editingRecordId,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleRetry,
    handleCancelEdit,
  } = useLearningRecordManager(learningRecordApi);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | LearningCategory>('all');
  const [historyMonth, setHistoryMonth] = useState('all');
  const [summaryRange, setSummaryRange] = useState<SummaryRange>('last7days');
  const [chartDetail, setChartDetail] = useState<ChartDetail | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);

  const totalMinutes = useMemo(
    () => records.reduce((sum, record) => sum + record.minutes, 0),
    [records]
  );

  const sortedRecords = useMemo(() => {
    return [...records].sort((left, right) => {
      const leftDate = new Date(`${left.date}T00:00:00`).getTime();
      const rightDate = new Date(`${right.date}T00:00:00`).getTime();

      if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
        return rightDate - leftDate;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    const byMonth = sortedRecords.filter((record) => {
      if (historyMonth === 'all') {
        return true;
      }

      return record.date.startsWith(historyMonth);
    });

    return filterLearningRecords(byMonth, filterCategory, searchTerm);
  }, [sortedRecords, filterCategory, searchTerm, historyMonth]);

  const pagedRecords = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filteredRecords.slice(start, end);
  }, [filteredRecords, page, pageSize]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  }, [filteredRecords.length, pageSize]);

  const historyMonths = useMemo(() => {
    return Array.from(
      new Set(
        records.map((record) => record.date.slice(0, 7)).filter((month) => month.length === 7)
      )
    ).sort((left, right) => right.localeCompare(left));
  }, [records]);

  const historyMonthOptions = useMemo(() => {
    return historyMonths;
  }, [historyMonths]);

  const periodSummary = useMemo(() => calculatePeriodSummary(records), [records]);

  const rangeSummary = useMemo(
    () => calculateRangeSummary(records, summaryRange),
    [records, summaryRange]
  );

  const categoryBars = useMemo(() => calculateCategoryBars(rangeSummary), [rangeSummary]);

  const dailyTrendBars = useMemo(() => calculateDailyTrendBars(records), [records]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterCategory, historyMonth]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages - 1));
  }, [totalPages]);

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">学習記録フォーム</h2>
      <p className="mt-1 text-sm text-slate-600">
        学習内容を記録して、進捗を少しずつ積み上げましょう。
      </p>

      {isInitialLoading && (
        <p
          className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
          role="status"
          aria-live="polite"
        >
          読み込み中...
        </p>
      )}

      {successMessage && (
        <p
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
          role="status"
          aria-live="polite"
          data-testid="success-notice"
        >
          {successMessage}
        </p>
      )}

      <LearningRecordInputForm
        form={form}
        errors={errors}
        apiError={apiError}
        canRetry={canRetry}
        isRetrying={isRetrying}
        isSaving={isSaving}
        isUpdating={isUpdating}
        editingRecordId={editingRecordId}
        onSubmit={handleSubmit}
        onFormChange={setForm}
        onRetry={() => void handleRetry()}
        onCancelEdit={handleCancelEdit}
      />

      <LearningRecordListSection
        records={pagedRecords}
        displayedRecordsCount={pagedRecords.length}
        filteredRecordsCount={filteredRecords.length}
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
        historyMonth={historyMonth}
        historyMonthOptions={historyMonthOptions}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        deletingRecordId={deletingRecordId}
        onSearchTermChange={setSearchTerm}
        onFilterCategoryChange={setFilterCategory}
        onSummaryRangeChange={setSummaryRange}
        onChartDetailChange={setChartDetail}
        onHistoryMonthChange={setHistoryMonth}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={(id) => void handleDelete(id)}
      />
    </section>
  );
};
