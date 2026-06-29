# learning-progress-dashboard

学習進捗を記録し、継続状況や理解度を見える化するためのフロントエンド個人開発プロジェクトです。
今回の目的は、学習で得た TypeScript の知識を実装に落とし込み、再学習ではなく「作って説明できる」アウトプットにすることです。

## 目的

- 学習記録を日々入力できるようにする
- 進捗や継続日数を見える化して、学習の振り返りをしやすくする
- TypeScript を使ったフロントエンド実装のアウトプットを増やす
- 個人開発の実績として、スキルシートや面談で説明できる材料を作る

## 機能

- 学習時間の記録
- 学習内容のメモ登録
- 記録一覧の表示
- 週次・月次の進捗確認
- フィルタや検索による記録の整理
- 継続日数や達成率の可視化

## 技術構成

- TypeScript
- Next.js
- React
- Vitest
- Playwright
- Storybook

## セットアップ（教材準拠）

教材の作成手順に合わせて、以下のオプションで土台を作成しています。

```bash
npx create-next-app@14.2.5 learning-progress-dashboard
```

選択オプション:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: No
- App Router: Yes
- Turbopack: なし（この世代では未指定）
- Import alias customize: No

## 現在の導入バージョン

2026-06-30 時点で、教材文面からの推定に合わせて採用した主要バージョンは以下です。

- Next.js: 14.2.5
- React: ^18
- React DOM: ^18
- TypeScript: 5.4.5
- ESLint: ^8
- Tailwind CSS: ^3.4.1
- Vitest: ^4.1.9
- @testing-library/react: ^16.3.2
- @testing-library/jest-dom: ^6.9.1
- jsdom: ^29.1.1

Node.js / npm（ローカル実行時）:

- Node.js: v24.3.0
- npm: 11.4.2

## 今後の予定

1. 画面設計と要件定義を固める
2. 学習記録の登録と一覧表示を実装する
3. 進捗の可視化を追加する
4. テストを整備する
5. UI を整えて公開できる状態にする

## API とテスト導入方針（教材が旧バージョンの場合）

教材が最新バージョンではない前提で、以下の順序で導入します。

1. まず教材準拠バージョンで完走し、動作確認を優先する
2. 完走後に最新との差分を確認し、必要な範囲だけ段階的に更新する

### Laravel API

- 初期段階はフロントを先行実装し、API I/F は固定のモックで進める
- API 接続を始める段階で Laravel 側の教材バージョンを再現し、疎通確認を行う
- その後、認証方式やレスポンス形式を含めて差分検証する

### テスト（Vitest / Playwright / Storybook）

- Vitest: ロジックとユーティリティの単体テストから導入
- Storybook: 主要 UI コンポーネントの見た目確認と状態整理に利用
- Playwright: 主要ユーザーフロー（登録・一覧・更新）のE2Eを最後に追加

#### 現在のVitest導入内容

- 設定ファイル: `vitest.config.ts`
- セットアップファイル: `vitest.setup.ts`
- サンプルテスト: `src/hooks/useCounter.test.ts`

実行コマンド:

```bash
npm run test
npm run test:watch
```

### バージョン運用ルール

- 先に教材準拠で固定（破壊的変更を避ける）
- 各ツールは一度に上げず、1カテゴリずつ更新して検証
- 更新時は lint / typecheck / test を毎回通してから反映

## 補足

このプロジェクトは、学習の記録を残すだけでなく、設計意図や改善の過程も残していくことを重視します。
