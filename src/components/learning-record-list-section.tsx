import { categoryLabels } from '@/src/lib/learning-record-analytics';
import { LearningRecordSummary } from '@/src/components/learning-record-summary';
import type {
  CategoryBar,
  ChartDetail,
  DailyTrendBar,
  PeriodSummary,
  RangeSummary,
  SummaryRange,
} from '@/src/lib/learning-record-analytics';
import type { LearningCategory, LearningRecord } from '@/src/types/learning-record';

type LearningRecordListSectionProps = {
  records: LearningRecord[];
  displayedRecordsCount: number;
  filteredRecordsCount: number;
  totalRecordsCount: number;
  totalMinutes: number;
  searchTerm: string;
  filterCategory: 'all' | LearningCategory;
  periodSummary: PeriodSummary;
  summaryRange: SummaryRange;
  rangeSummary: RangeSummary;
  categoryBars: CategoryBar[];
  dailyTrendBars: DailyTrendBar[];
  chartDetail: ChartDetail | null;
  historyMonth: string;
  historyMonthOptions: string[];
  page: number;
  pageSize: number;
  totalPages: number;
  onSearchTermChange: (value: string) => void;
  onFilterCategoryChange: (value: 'all' | LearningCategory) => void;
  onSummaryRangeChange: (range: SummaryRange) => void;
  onChartDetailChange: (detail: ChartDetail | null) => void;
  onHistoryMonthChange: (value: string) => void;
  onPageChange: (value: number) => void;
  deletingRecordId: string | null;
  onEdit: (record: LearningRecord) => void;
  onDelete: (id: string) => void;
};

export const LearningRecordListSection = ({
  records,
  displayedRecordsCount,
  filteredRecordsCount,
  totalRecordsCount,
  totalMinutes,
  searchTerm,
  filterCategory,
  periodSummary,
  summaryRange,
  rangeSummary,
  categoryBars,
  dailyTrendBars,
  chartDetail,
  historyMonth,
  historyMonthOptions,
  page,
  pageSize,
  totalPages,
  deletingRecordId,
  onSearchTermChange,
  onFilterCategoryChange,
  onSummaryRangeChange,
  onChartDetailChange,
  onHistoryMonthChange,
  onPageChange,
  onEdit,
  onDelete,
}: LearningRecordListSectionProps) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index);

  const formatHistoryMonthLabel = (month: string) => {
    const [year, monthNumber] = month.split('-');

    if (!year || !monthNumber) {
      return month;
    }

    return `${year}年${monthNumber}月`;
  };

  return (
    <div className="mt-8 border-t border-slate-200 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">記録一覧</h3>
          <p className="mt-1 text-sm text-slate-600">
            現在 {displayedRecordsCount}件を表示中 / 条件一致 {filteredRecordsCount}件 / 全体 {totalRecordsCount}件
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          並び順: 日付の新しい順
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-600">累計学習時間: {totalMinutes}分</p>

      <LearningRecordSummary
        periodSummary={periodSummary}
        summaryRange={summaryRange}
        rangeSummary={rangeSummary}
        categoryBars={categoryBars}
        dailyTrendBars={dailyTrendBars}
        chartDetail={chartDetail}
        onSummaryRangeChange={onSummaryRangeChange}
        onChartDetailChange={onChartDetailChange}
      />

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">検索</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="タイトル・メモで検索"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">絞り込みカテゴリ</span>
          <select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value as 'all' | LearningCategory)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring"
          >
            <option value="all">すべて</option>
            {(Object.keys(categoryLabels) as LearningCategory[]).map((key) => (
              <option key={key} value={key}>
                {categoryLabels[key]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium !text-slate-800">
          <span className="!text-slate-900">表示月</span>
          <select
            value={historyMonth}
            onChange={(e) => onHistoryMonthChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring"
          >
            <option value="all">すべて</option>
            {historyMonthOptions.map((month) => (
              <option key={month} value={month}>
                {formatHistoryMonthLabel(month)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
        <p>
          表示件数: {displayedRecordsCount}件 / 1ページ: {pageSize}件 / ページ {page + 1}/
          {totalPages}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            前へ
          </button>
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                pageNumber === page
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-300 text-slate-700'
              }`}
            >
              {pageNumber + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {records.map((record) => (
          <li key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{record.title}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    {categoryLabels[record.category]}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  学習日: {record.date} / 学習時間: {record.minutes}分
                </p>
                {record.note && (
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                    {record.note}
                  </p>
                )}
              </div>

              {(() => {
                const isDeleting = deletingRecordId === record.id;

                return (
                  <div className="flex shrink-0 gap-2 sm:pt-1">
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      disabled={isDeleting}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(record.id)}
                      disabled={isDeleting}
                      aria-busy={isDeleting}
                      className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      {isDeleting ? '削除中...' : '削除'}
                    </button>
                  </div>
                );
              })()}
            </div>
          </li>
        ))}

        {totalRecordsCount === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            まだ記録がありません。
          </li>
        )}

        {totalRecordsCount > 0 && filteredRecordsCount === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            条件に一致する記録がありません。
          </li>
        )}
      </ul>
    </div>
  );
};
