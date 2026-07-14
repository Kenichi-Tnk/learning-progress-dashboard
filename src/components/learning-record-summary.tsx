import type {
  CategoryBar,
  ChartDetail,
  DailyTrendBar,
  PeriodSummary,
  RangeSummary,
  SummaryRange,
} from '@/src/lib/learning-record-analytics';

type LearningRecordSummaryProps = {
  periodSummary: PeriodSummary;
  summaryRange: SummaryRange;
  rangeSummary: RangeSummary;
  categoryBars: CategoryBar[];
  dailyTrendBars: DailyTrendBar[];
  chartDetail: ChartDetail | null;
  onSummaryRangeChange: (range: SummaryRange) => void;
  onChartDetailChange: (detail: ChartDetail | null) => void;
};

export const LearningRecordSummary = ({
  periodSummary,
  summaryRange,
  rangeSummary,
  categoryBars,
  dailyTrendBars,
  chartDetail,
  onSummaryRangeChange,
  onChartDetailChange,
}: LearningRecordSummaryProps) => {
  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">今週</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {periodSummary.weeklyCount}件 / {periodSummary.weeklyMinutes}分
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">今月</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {periodSummary.monthlyCount}件 / {periodSummary.monthlyMinutes}分
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">集計表示</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              対象期間: {summaryRange === 'last7days' ? '直近7日' : '当月累計'}
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => onSummaryRangeChange('last7days')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                summaryRange === 'last7days'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              直近7日
            </button>
            <button
              type="button"
              onClick={() => onSummaryRangeChange('monthToDate')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                summaryRange === 'monthToDate'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              当月累計
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            件数: <span className="font-semibold text-slate-900">{rangeSummary.count}件</span>
          </p>
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            学習時間: <span className="font-semibold text-slate-900">{rangeSummary.minutes}分</span>
          </p>
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            平均:{' '}
            <span className="font-semibold text-slate-900">
              {rangeSummary.count === 0 ? 0 : Math.round(rangeSummary.minutes / rangeSummary.count)}
              分/件
            </span>
          </p>
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">詳細表示</p>
          {chartDetail ? (
            <p className="mt-1 text-sm text-slate-700" data-testid="chart-detail-panel">
              {chartDetail.type === 'category' ? 'カテゴリ' : '日別'}: {chartDetail.label} /{' '}
              <span className="font-semibold text-slate-900">{chartDetail.minutes}分</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500" data-testid="chart-detail-panel">
              バーにカーソルを合わせるか、フォーカスすると詳細が表示されます。
            </p>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {categoryBars.map((bar) => (
            <div
              key={bar.category}
              className="grid grid-cols-[110px_1fr_48px] items-center gap-2 rounded-md px-1 py-1"
              onMouseEnter={() =>
                onChartDetailChange({
                  type: 'category',
                  label: bar.label,
                  minutes: bar.minutes,
                })
              }
              onMouseLeave={() => onChartDetailChange(null)}
              onFocus={() =>
                onChartDetailChange({
                  type: 'category',
                  label: bar.label,
                  minutes: bar.minutes,
                })
              }
              onBlur={() => onChartDetailChange(null)}
              tabIndex={0}
              role="listitem"
            >
              <p className="text-xs text-slate-700">{bar.label}</p>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-[width]"
                  style={{ width: `${bar.widthPercent}%` }}
                />
              </div>
              <p className="text-right text-xs text-slate-700">{bar.minutes}分</p>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-lg border border-slate-200 bg-white p-3"
          data-testid="daily-trend-chart"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            直近7日の日別推移
          </p>
          <div className="mt-2 space-y-2">
            {dailyTrendBars.map((bar) => (
              <div
                key={bar.key}
                className={`grid grid-cols-[72px_1fr_48px] items-center gap-2 ${
                  bar.minutes === 0 ? 'opacity-45' : ''
                } rounded-md px-1 py-1`}
                data-testid="daily-bar-row"
                data-zero-day={bar.minutes === 0 ? 'true' : 'false'}
                onMouseEnter={() =>
                  onChartDetailChange({
                    type: 'daily',
                    label: bar.label,
                    minutes: bar.minutes,
                  })
                }
                onMouseLeave={() => onChartDetailChange(null)}
                onFocus={() =>
                  onChartDetailChange({
                    type: 'daily',
                    label: bar.label,
                    minutes: bar.minutes,
                  })
                }
                onBlur={() => onChartDetailChange(null)}
                tabIndex={0}
                role="listitem"
              >
                <p className="text-xs text-slate-700">{bar.label}</p>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full transition-[width] ${
                      bar.minutes === 0 ? 'bg-slate-300' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${bar.widthPercent}%` }}
                  />
                </div>
                <p className="text-right text-xs text-slate-700">{bar.minutes}分</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
