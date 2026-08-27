# バックエンド API 契約（Learning Progress）

この文書は、フロント側の実装に合わせてバックエンドに渡す最小契約です。 1ページで確認できるように要点だけをまとめます。

## 1. 前提

- Base URL: `/api/learning-progresses`
- Health Check: `/api/health`
- Content-Type: `application/json`
- CORS: `http://localhost:3000` を許可
- 既定の状態: `status = "in_progress"`

## 2. フロント側の最終形

フロント側が利用するレコードは次の型です。

```ts
{
  id: '1',
  createdAt: '2026-07-06T10:00:00.000000Z',
  date: '2026-07-06',
  title: 'React学習',
  minutes: 45,
  category: 'frontend',
  note: 'hooksを学習'
}
```

バックエンドの保存形式とフロントの型の対応は次の通りです。

- `date` = `started_at.slice(0, 10)`
- `minutes` = `memo` の `[minutes:N]` から抽出
- `note` = `[minutes:N]` を除いた本文
- `id` = `String(id)`
- `createdAt` = `created_at`
- `category` = そのまま使用

## 3. API 一覧

### GET /api/health

- 200 OK
- 例:

```json
{ "status": "ok" }
```

### GET /api/learning-progresses

- 200 OK
- 返却: 学習記録配列

```json
[
  {
    "id": 1,
    "title": "React学習",
    "category": "frontend",
    "status": "in_progress",
    "memo": "[minutes:45]hooksを学習",
    "started_at": "2026-07-06 00:00:00",
    "completed_at": null,
    "created_at": "2026-07-06T10:00:00.000000Z",
    "updated_at": "2026-07-06T10:00:00.000000Z"
  }
]
```

### POST /api/learning-progresses

- 201 Created
- リクエスト:

```json
{
  "title": "React学習",
  "category": "frontend",
  "status": "in_progress",
  "memo": "[minutes:45]hooksを学習",
  "started_at": "2026-07-06 00:00:00"
}
```

- 返却: 新規作成したレコード

### PUT /api/learning-progresses/{id}

- 200 OK
- リクエスト: POST と同じ
- 返却: 更新後のレコード

### DELETE /api/learning-progresses/{id}

- 204 No Content

## 4. ルール

- `category` は `frontend | backend | algorithm | infra | other` のいずれか
- `memo` は `[minutes:N]` 形式で保存する
  - 例: `[minutes:45]hooksを学習`
- `started_at` は `YYYY-MM-DD HH:mm:ss` 形式
- `created_at` / `updated_at` は ISO 8601 形式
- `status` は現時点では `in_progress` を固定で扱う

## 5. バリデーション

- `title`: 2文字以上
- `category`: 上記 enum の値
- `memo`: `[minutes:N]` 形式を前提
- `started_at`: 文字列で必須

## 6. エラー

- 422: バリデーションエラー
- 404: 対象IDが存在しない
- 500: サーバー内部エラー

例:

```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["タイトルは 2 文字以上で入力してください。"]
  }
}
```

## 7. 実装メモ

- フロント側は `response.ok` で成功可否を判定する前提
- UI の表示文言はフロントで固定し、API はデータ返却に集中する
- これで `memory` モードと `http` モードの差分が最小限になります
