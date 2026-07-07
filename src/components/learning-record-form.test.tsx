import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
});
