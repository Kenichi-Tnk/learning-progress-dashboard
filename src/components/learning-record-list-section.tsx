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
  filteredRecords: LearningRecord[];
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
  onSearchTermChange: (value: string) => void;
  onFilterCategoryChange: (value: 'all' | LearningCategory) => void;
  onSummaryRangeChange: (range: SummaryRange) => void;
  onChartDetailChange: (detail: ChartDetail | null) => void;
  deletingRecordId: string | null;
  onEdit: (record: LearningRecord) => void;
  onDelete: (id: string) => void;
};

export const LearningRecordListSection = ({
  filteredRecords,
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
  deletingRecordId,
  onSearchTermChange,
  onFilterCategoryChange,
  onSummaryRangeChange,
  onChartDetailChange,
  onEdit,
  onDelete,
}: LearningRecordListSectionProps) => {
  return (
    <div className="mt-8 border-t border-slate-200 pt-4">
      <h3 className="text-lg font-semibold text-slate-900">記録一覧</h3>
      <p className="mt-1 text-sm text-slate-600">
        表示: {filteredRecords.length}件 / 合計: {totalRecordsCount}件 / {totalMinutes}分
      </p>

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

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
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
      </div>

      <ul className="mt-4 space-y-3">
        {filteredRecords.map((record) => (
          <li key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="font-medium text-slate-900">{record.title}</p>
            <p className="text-sm text-slate-600">
              {record.date} / {record.minutes}分 / {categoryLabels[record.category]}
            </p>
            {record.note && <p className="mt-1 text-sm !text-slate-900">{record.note}</p>}
            <div className="mt-3 flex gap-2">
              {(() => {
                const isDeleting = deletingRecordId === record.id;

                return (
                  <>
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
                  </>
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

        {totalRecordsCount > 0 && filteredRecords.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            条件に一致する記録がありません。
          </li>
        )}
      </ul>
    </div>
  );
};
