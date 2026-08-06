import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryLearningRecordAPI } from '@/src/services/learning-record-api';
import { LearningRecordForm } from './learning-record-form';

const createDeferred = <T,>() => {
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

const fillAndSubmitRecord = async ({
  date,
  title,
  minutes,
  category = 'frontend',
  note,
}: {
  date: string;
  title: string;
  minutes: string;
  category?: 'frontend' | 'backend' | 'algorithm' | 'infra' | 'other';
  note: string;
}) => {
  fireEvent.change(screen.getByLabelText('日付'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: title } });
  fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: minutes } });
  fireEvent.change(screen.getByLabelText('カテゴリ'), { target: { value: category } });
  fireEvent.change(screen.getByLabelText('メモ'), { target: { value: note } });
  fireEvent.click(screen.getByRole('button', { name: '保存する' }));

  await waitFor(() => {
    expect(screen.getByText(title)).toBeInTheDocument();
  });
};

describe('LearningRecordForm', () => {
  it('初回読み込み中はローディング表示が出て、完了後に消えること', async () => {
    const deferred = createDeferred<
      Array<{
        id: string;
        createdAt: string;
        date: string;
        title: string;
        minutes: number;
        category: 'frontend';
        note: string;
      }>
    >();

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'getAll').mockImplementationOnce(
      () => deferred.promise
    );

    render(createElement(LearningRecordForm));

    expect(screen.getByRole('status')).toHaveTextContent('読み込み中...');

    deferred.resolve([]);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('初期表示でフォームの各要素が正しく表示されること', () => {
    render(createElement(LearningRecordForm));

    expect(screen.getByText('学習記録フォーム')).toBeInTheDocument();
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument();
  });

  it('記録を追加して削除できること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Vitest Practice' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'Add and delete test.' } });

    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('Vitest Practice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(screen.getByText('まだ記録がありません。')).toBeInTheDocument();
    });
  });

  it('記録を編集して更新すると一覧に反映されること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '初期タイトル' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '初期メモ' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('初期タイトル')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '編集' }));

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '更新後タイトル' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '更新後メモ' } });
    fireEvent.click(screen.getByRole('button', { name: '更新する' }));

    await waitFor(() => {
      expect(screen.queryByText('初期タイトル')).not.toBeInTheDocument();
      expect(screen.getByText('更新後タイトル')).toBeInTheDocument();
      expect(screen.getByText('更新後メモ')).toBeInTheDocument();
    });
  });

  it('更新をキャンセルするとフォームが初期化されること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '編集対象' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '編集前メモ' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('編集対象')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '編集' }));
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'キャンセル予定' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'キャンセル予定メモ' } });

    fireEvent.click(screen.getByRole('button', { name: '編集をキャンセル' }));

    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const noteTextarea = screen.getByLabelText('メモ') as HTMLTextAreaElement;
    const minutesInput = screen.getByLabelText('学習時間（分）') as HTMLInputElement;
    const dateInput = screen.getByLabelText('日付') as HTMLInputElement;

    expect(titleInput.value).toBe('');
    expect(noteTextarea.value).toBe('');
    expect(minutesInput.value).toBe('30');
    expect(dateInput.value).toBe('');
    expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument();
  });

  it('検索とカテゴリ絞り込みで表示を切り替えられること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-07' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'React学習' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'hooksを学習' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('React学習')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-08' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Laravel学習' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('カテゴリ'), { target: { value: 'backend' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'API設計を確認' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('Laravel学習')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('検索'), { target: { value: 'React' } });
    expect(screen.getByText('React学習')).toBeInTheDocument();
    expect(screen.queryByText('Laravel学習')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('検索'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('絞り込みカテゴリ'), { target: { value: 'backend' } });
    expect(screen.getByText('Laravel学習')).toBeInTheDocument();
    expect(screen.queryByText('React学習')).not.toBeInTheDocument();
  });

  it('直近7日と当月累計を切り替えて集計表示できること', async () => {
    render(createElement(LearningRecordForm));

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = `${today.getMonth() + 1}`.padStart(2, '0');
    const dd = `${today.getDate()}`.padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: todayString } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '本日の学習' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '今週・今月に含まれる' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('本日の学習')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '過去の学習' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '集計対象外' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('過去の学習')).toBeInTheDocument();
    });

    expect(screen.getByText('集計表示')).toBeInTheDocument();
    expect(screen.getByText('対象期間: 直近7日')).toBeInTheDocument();
    expect(screen.getByText('件数:')).toBeInTheDocument();
    expect(screen.getByText('学習時間:')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent?.trim() === '学習時間: 20分')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '当月累計' }));
    expect(screen.getByText('対象期間: 当月累計')).toBeInTheDocument();
  });

  it('直近7日の日別推移バーが7本表示され、当日の分数が反映されること', async () => {
    render(createElement(LearningRecordForm));

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = `${today.getMonth() + 1}`.padStart(2, '0');
    const dd = `${today.getDate()}`.padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: todayString } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '日別推移確認' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '日別バー確認用' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('日別推移確認')).toBeInTheDocument();
    });

    const dailyChart = screen.getByTestId('daily-trend-chart');
    expect(within(dailyChart).getByText('直近7日の日別推移')).toBeInTheDocument();
    expect(within(dailyChart).getAllByTestId('daily-bar-row')).toHaveLength(7);
    expect(within(dailyChart).getByText('25分')).toBeInTheDocument();

    const todayWeekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    const todayLabel = `${today.getMonth() + 1}/${today.getDate()}(${todayWeekdayLabels[today.getDay()]})`;
    expect(within(dailyChart).getByText(todayLabel)).toBeInTheDocument();

    const zeroDayRows = within(dailyChart)
      .getAllByTestId('daily-bar-row')
      .filter((row) => row.getAttribute('data-zero-day') === 'true');
    expect(zeroDayRows.length).toBeGreaterThan(0);
  });

  it('グラフのバーにホバーすると詳細表示が切り替わること', async () => {
    render(createElement(LearningRecordForm));

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = `${today.getMonth() + 1}`.padStart(2, '0');
    const dd = `${today.getDate()}`.padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;
    const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    const todayLabel = `${today.getMonth() + 1}/${today.getDate()}(${weekdayLabels[today.getDay()]})`;

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: todayString } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'フロント学習' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '35' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '詳細表示テスト' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('フロント学習')).toBeInTheDocument();
    });

    const categoryBarLabel = screen
      .getAllByText('フロントエンド')
      .find((element) => element.tagName === 'P');
    if (!categoryBarLabel) {
      throw new Error('カテゴリバーのラベルが見つかりませんでした。');
    }

    fireEvent.mouseEnter(categoryBarLabel);
    expect(screen.getByTestId('chart-detail-panel')).toHaveTextContent(
      'カテゴリ: フロントエンド / 35分'
    );

    const dailyChart = screen.getByTestId('daily-trend-chart');
    fireEvent.mouseEnter(within(dailyChart).getByText(todayLabel));
    expect(screen.getByTestId('chart-detail-panel')).toHaveTextContent(
      `日別: ${todayLabel} / 35分`
    );
  });

  it('記録一覧を日付降順に並べ、ページャと履歴月フィルタで切り替えられること', async () => {
    render(createElement(LearningRecordForm));

    const records = [
      { date: '2026-06-28', title: '6月の記録', minutes: '20', category: 'other', note: 'jun' },
      { date: '2026-07-01', title: '7月前半', minutes: '25', category: 'frontend', note: 'jul-1' },
      { date: '2026-07-15', title: '7月中盤', minutes: '30', category: 'backend', note: 'jul-2' },
      { date: '2026-07-30', title: '7月後半', minutes: '35', category: 'algorithm', note: 'jul-3' },
      { date: '2026-08-01', title: '8月その1', minutes: '40', category: 'frontend', note: 'aug-1' },
      { date: '2026-08-10', title: '8月その2', minutes: '45', category: 'infra', note: 'aug-2' },
      { date: '2026-08-20', title: '8月その3', minutes: '50', category: 'backend', note: 'aug-3' },
    ] as const;

    for (const record of records) {
      await fillAndSubmitRecord(record);
    }

    const listItemsPage1 = screen.getAllByRole('listitem').filter((item) =>
      item.className.includes('shadow-sm')
    );
    expect(within(listItemsPage1[0]).getByText('8月その3')).toBeInTheDocument();
    expect(within(listItemsPage1[1]).getByText('8月その2')).toBeInTheDocument();
    expect(within(listItemsPage1[2]).getByText('8月その1')).toBeInTheDocument();
    expect(within(listItemsPage1[3]).getByText('7月後半')).toBeInTheDocument();
    expect(within(listItemsPage1[4]).getByText('7月中盤')).toBeInTheDocument();
    expect(screen.queryByText('7月前半')).not.toBeInTheDocument();

    expect(screen.getByText('現在 5件を表示中 / 条件一致 7件 / 全体 7件')).toBeInTheDocument();
    expect(screen.getByText('表示件数: 5件 / 1ページ: 5件 / ページ 1/2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    await waitFor(() => {
      expect(screen.getByText('7月前半')).toBeInTheDocument();
      expect(screen.getByText('6月の記録')).toBeInTheDocument();
    });

    expect(screen.queryByText('8月その3')).not.toBeInTheDocument();
    expect(screen.getByText('表示件数: 2件 / 1ページ: 5件 / ページ 2/2')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('表示月'), { target: { value: '2026-07' } });

    await waitFor(() => {
      expect(screen.getByText('7月後半')).toBeInTheDocument();
      expect(screen.getByText('7月中盤')).toBeInTheDocument();
      expect(screen.getByText('7月前半')).toBeInTheDocument();
    });

    expect(screen.queryByText('8月その3')).not.toBeInTheDocument();
    expect(screen.queryByText('6月の記録')).not.toBeInTheDocument();
    expect(screen.getByText('現在 3件を表示中 / 条件一致 3件 / 全体 7件')).toBeInTheDocument();
    expect(screen.getByText('表示件数: 3件 / 1ページ: 5件 / ページ 1/1')).toBeInTheDocument();
  });

  it('初期読込に失敗した場合はエラーメッセージを表示すること', async () => {
    const getAllSpy = vi
      .spyOn(InMemoryLearningRecordAPI.prototype, 'getAll')
      .mockRejectedValueOnce(new Error('load failed'))
      .mockResolvedValueOnce([
        {
          id: 'retried-1',
          createdAt: '2026-07-17T10:00:00.000Z',
          date: '2026-07-17',
          title: '再読込成功',
          minutes: 30,
          category: 'frontend',
          note: 'retry success',
        },
      ]);

    render(createElement(LearningRecordForm));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '記録の読み込みに失敗しました。時間をおいて再度お試しください。'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: '再試行する' }));

    await waitFor(() => {
      expect(screen.getByText('再読込成功')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    expect(getAllSpy).toHaveBeenCalledTimes(2);
  });

  it('保存に失敗した場合はエラーメッセージを表示し一覧を更新しないこと', async () => {
    const addSpy = vi
      .spyOn(InMemoryLearningRecordAPI.prototype, 'add')
      .mockRejectedValueOnce(new Error('save failed'))
      .mockResolvedValueOnce({
        id: 'saved-after-retry',
        createdAt: '2026-07-17T10:00:00.000Z',
        date: '2026-07-06',
        title: '失敗する保存',
        minutes: 45,
        category: 'frontend',
        note: '保存エラー確認',
      });

    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '失敗する保存' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '保存エラー確認' } });

    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '記録の保存に失敗しました。時間をおいて再度お試しください。'
      );
    });

    expect(screen.queryByText('失敗する保存')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '再試行する' }));

    await waitFor(() => {
      expect(screen.getByText('失敗する保存')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    expect(addSpy).toHaveBeenCalledTimes(2);
  });

  it('再試行中はボタンが無効化されローディング表示に切り替わること', async () => {
    const deferred = createDeferred<{
      id: string;
      createdAt: string;
      date: string;
      title: string;
      minutes: number;
      category: 'frontend';
      note: string;
    }>();

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'add')
      .mockRejectedValueOnce(new Error('save failed'))
      .mockImplementationOnce(() => deferred.promise);

    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: '再試行ローディング' },
    });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'retry loading' } });

    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '記録の保存に失敗しました。時間をおいて再度お試しください。'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: '再試行する' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '再試行中...' })).toBeDisabled();
    });

    deferred.resolve({
      id: 'retry-loading-success',
      createdAt: '2026-07-17T10:00:00.000Z',
      date: '2026-07-06',
      title: '再試行ローディング',
      minutes: 45,
      category: 'frontend',
      note: 'retry loading',
    });

    await waitFor(() => {
      expect(screen.getByText('再試行ローディング')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('保存中は送信ボタンが無効化され保存中表示になること', async () => {
    const deferred = createDeferred<{
      id: string;
      createdAt: string;
      date: string;
      title: string;
      minutes: number;
      category: 'frontend';
      note: string;
    }>();

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'add').mockImplementationOnce(
      () => deferred.promise
    );

    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '保存中確認' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'save pending' } });

    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled();
    });

    deferred.resolve({
      id: 'save-pending-1',
      createdAt: '2026-07-17T10:00:00.000Z',
      date: '2026-07-06',
      title: '保存中確認',
      minutes: 45,
      category: 'frontend',
      note: 'save pending',
    });

    await waitFor(() => {
      expect(screen.getByText('保存中確認')).toBeInTheDocument();
    });
  });

  it('更新中は送信ボタンが無効化され更新中表示になること', async () => {
    const addDeferred = createDeferred<{
      id: string;
      createdAt: string;
      date: string;
      title: string;
      minutes: number;
      category: 'frontend';
      note: string;
    }>();
    const updateDeferred = createDeferred<{
      id: string;
      createdAt: string;
      date: string;
      title: string;
      minutes: number;
      category: 'frontend';
      note: string;
    }>();

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'add').mockImplementationOnce(
      () => addDeferred.promise
    );
    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'update').mockImplementationOnce(
      () => updateDeferred.promise
    );

    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '更新元' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'before update' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    addDeferred.resolve({
      id: 'update-base-1',
      createdAt: '2026-07-17T10:00:00.000Z',
      date: '2026-07-06',
      title: '更新元',
      minutes: 45,
      category: 'frontend',
      note: 'before update',
    });

    await waitFor(() => {
      expect(screen.getByText('更新元')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '編集' }));
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '更新中確認' } });
    fireEvent.click(screen.getByRole('button', { name: '更新する' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '更新中...' })).toBeDisabled();
    });

    updateDeferred.resolve({
      id: 'update-base-1',
      createdAt: '2026-07-17T10:00:00.000Z',
      date: '2026-07-06',
      title: '更新中確認',
      minutes: 45,
      category: 'frontend',
      note: 'before update',
    });

    await waitFor(() => {
      expect(screen.getByText('更新中確認')).toBeInTheDocument();
    });
  });

  it('削除中は対象レコードの削除ボタンが無効化され削除中表示になること', async () => {
    const addDeferred = createDeferred<{
      id: string;
      createdAt: string;
      date: string;
      title: string;
      minutes: number;
      category: 'frontend';
      note: string;
    }>();
    const deleteDeferred = createDeferred<void>();

    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'add').mockImplementationOnce(
      () => addDeferred.promise
    );
    vi.spyOn(InMemoryLearningRecordAPI.prototype, 'delete').mockImplementationOnce(
      () => deleteDeferred.promise
    );

    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '削除中確認' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'delete pending' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    addDeferred.resolve({
      id: 'delete-base-1',
      createdAt: '2026-07-17T10:00:00.000Z',
      date: '2026-07-06',
      title: '削除中確認',
      minutes: 45,
      category: 'frontend',
      note: 'delete pending',
    });

    await waitFor(() => {
      expect(screen.getByText('削除中確認')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '削除中...' })).toBeDisabled();
    });

    deleteDeferred.resolve();

    await waitFor(() => {
      expect(screen.getByText('まだ記録がありません。')).toBeInTheDocument();
    });
  });

  it('保存成功時に保存完了メッセージが表示されること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '保存成功通知' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'saved' } });

    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByTestId('success-notice')).toHaveTextContent('保存完了しました。');
    });
  });

  it('更新成功時に更新完了メッセージが表示されること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '更新前タイトル' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '更新前メモ' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('更新前タイトル')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '編集' }));
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '更新後タイトル' } });
    fireEvent.click(screen.getByRole('button', { name: '更新する' }));

    await waitFor(() => {
      expect(screen.getByTestId('success-notice')).toHaveTextContent('更新完了しました。');
    });
  });

  it('削除成功時に削除完了メッセージが表示されること', async () => {
    render(createElement(LearningRecordForm));

    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2026-07-06' } });
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '削除通知確認' } });
    fireEvent.change(screen.getByLabelText('学習時間（分）'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'delete success' } });
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => {
      expect(screen.getByText('削除通知確認')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(screen.getByTestId('success-notice')).toHaveTextContent('削除完了しました。');
    });
  });
});
