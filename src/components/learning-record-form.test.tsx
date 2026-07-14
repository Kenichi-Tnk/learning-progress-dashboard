import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { LearningRecordForm } from './learning-record-form';

describe('LearningRecordForm', () => {
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

    const categoryBarLabel = screen.getAllByText('フロントエンド').find((element) => element.tagName === 'P');
    if (!categoryBarLabel) {
      throw new Error('カテゴリバーのラベルが見つかりませんでした。');
    }

    fireEvent.mouseEnter(categoryBarLabel);
    expect(screen.getByTestId('chart-detail-panel')).toHaveTextContent('カテゴリ: フロントエンド / 35分');

    const dailyChart = screen.getByTestId('daily-trend-chart');
    fireEvent.mouseEnter(within(dailyChart).getByText(todayLabel));
    expect(screen.getByTestId('chart-detail-panel')).toHaveTextContent(`日別: ${todayLabel} / 35分`);
  });
});
