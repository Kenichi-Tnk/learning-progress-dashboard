# learning-progress-dashboard

学習進捗を記録し、継続状況や理解度を見える化するためのフロントエンド個人開発プロジェクトです。
今回の目的は、学習で得た TypeScript の知識を実装に落とし込み、再学習ではなく「作って説明できる」アウトプットにすることです。

## 目的

- 学習記録を日々入力できるようにする
- 進捗や継続日数を見える化して、学習の振り返りをしやすくする
- TypeScript を使ったフロントエンド実装のアウトプットを増やす
- 個人開発の実績として、スキルシートや面談で説明できる材料を作る

## 機能

- 学習記録の登録
- 学習記録の編集・削除
- タイトル・メモ検索
- カテゴリ絞り込み
- 週次・月次サマリー表示
- 直近7日 / 当月累計の集計切り替え
- カテゴリ別学習時間の可視化
- 直近7日の日別推移表示
- API エラー時の再試行
- 保存中・更新中・削除中の状態表示

## 技術構成

- Next.js 14.2.5
- React ^18
- React DOM ^18
- TypeScript 5.4.5
- Tailwind CSS ^3.4.1
- ESLint ^8
- Prettier ^3.3.3
- Vitest ^4.1.9
- @testing-library/react ^16.3.2
- @testing-library/jest-dom ^6.9.1
- jsdom ^29.1.1
- @vitejs/plugin-react ^6.0.3

## セットアップ（教材準拠）

教材の作成手順に合わせて、以下のオプションで土台を作成しています。

```bash
npx create-next-app@14.2.5 learning-progress-dashboard
```

選択オプション:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Turbopack: なし（この世代では未指定）
- Import alias customize: No

## 現在の導入バージョン

2026-07-19 時点で、現在導入している主要バージョンは以下です。

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
- @vitejs/plugin-react: ^6.0.3
- Prettier: ^3.3.3

Node.js / npm（ローカル実行環境）:

- Node.js: v24.3.0
- npm: 11.4.2

## 現在の実装状況

- 学習記録フォームをコンポーネント分割して実装
- カスタムフックで記録の状態管理と CRUD を集約
- モック API として InMemoryLearningRecordAPI を実装
- バリデーション、集計、可視化ロジックを lib に分離
- API 失敗時のエラー表示と再試行導線を実装
- 保存・更新・削除ごとに処理中表示を分離

## テスト構成

- 単体テスト: Vitest
- UI テスト: Testing Library + jsdom
- 現在の主な対象:
  - バリデーション
  - 集計ロジック
  - モック API
  - 学習記録フォーム
  - 状態管理フック

### 現在の Vitest 導入内容

- 設定ファイル: vitest.config.mjs
- セットアップファイル: vitest.setup.ts
- 主なテストファイル:
  - src/lib/learning-record-validation.test.ts
  - src/lib/learning-record-analytics.test.ts
  - src/services/learning-record-api.test.ts
  - src/hooks/use-learning-record-manager.test.ts
  - src/components/learning-record-form.test.tsx

## 今後の予定

1. README を実装状況に合わせて継続更新する
2. 読み込み中や成功通知など UI フィードバックを整える
3. モック API から実 API へ置き換えやすい構成を整える
4. 必要に応じて E2E テスト導入を検討する
5. 公開を見据えて画面の完成度を上げる

## API とテスト導入方針（教材が旧バージョンの場合）

教材が最新バージョンではない前提で、以下の順序で導入します。

1. まず教材準拠バージョンで完走し、動作確認を優先する
2. 完走後に最新との差分を確認し、必要な範囲だけ段階的に更新する

### Laravel API

- 初期段階はフロントを先行実装し、API I/F は固定のモックで進める
- API 接続を始める段階で Laravel 側の教材バージョンを再現し、疎通確認を行う
- その後、認証方式やレスポンス形式を含めて差分検証する

### 実 API 差し替えメモ

- 現在は API 層を抽象化し、以下 2 モードで切り替え可能
  - `memory`: InMemoryLearningRecordAPI を使用
  - `http`: HttpLearningRecordAPI を使用
- 切り替えは環境変数 `NEXT_PUBLIC_LEARNING_RECORD_API_MODE` で行う（`memory` / `http`）
- HTTP モードの既定ベース URL は `/api/learning-records`

想定エンドポイント:

- `GET /api/learning-records`: 記録一覧取得
- `POST /api/learning-records`: 記録作成
- `PUT /api/learning-records/{id}`: 記録更新
- `DELETE /api/learning-records/{id}`: 記録削除

### テスト

- Vitest: ロジック、フック、コンポーネントテストに利用
- Testing Library: UI 操作と表示確認に利用
- Playwright / Storybook: 現時点では未導入。必要になった段階で追加検討

#### 実行コマンド

```bash
npm run test
npm run test:watch
npm run lint
npm run typecheck
```

### バージョン運用ルール

- 先に教材準拠で固定（破壊的変更を避ける）
- 各ツールは一度に上げず、1カテゴリずつ更新して検証
- 更新時は lint / typecheck / test を毎回通してから反映

## 補足

このプロジェクトは、学習の記録を残すだけでなく、設計意図や改善の過程も残していくことを重視します。
