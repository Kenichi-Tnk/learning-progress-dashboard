# Frontend-Backend API Ready Checklist

このチェックリストは、フロントエンド実装後にバックエンド API 開発へ進む前の
「接続準備ゲート」です。毎回、上から順に確認してください。

## 使い方

- 実装開始前に、このファイルを開いてチェックする
- すべて `Done` になるまで API 実装・結合作業に進まない
- 詰まったら「どの項目で止まったか」を Issue / メモに残す

## 0. 実行ディレクトリ確認

- [ ] `pwd` がフロントプロジェクトのルートになっている
- [ ] `package.json` の `scripts.dev` が想定どおり (`next dev`) である
- [ ] 間違ったプロジェクトで `npm run dev` を実行していない

確認コマンド例:

```bash
pwd
cat package.json
```

## 1. ポートと起動状態

- [ ] フロントの使用ポート (例: `3000`) が競合していない
- [ ] バックエンドの使用ポート (例: `80` / `8000`) が競合していない
- [ ] フロント開発サーバーが正常起動している
- [ ] バックエンド開発サーバー (またはコンテナ) が正常起動している

確認コマンド例:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN || true
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

## 2. 環境変数

- [ ] API のベース URL を `NEXT_PUBLIC_*` で定義している
- [ ] `.env.example` に必要な環境変数が記載されている
- [ ] `.env.local` の値が実行環境と一致している
- [ ] API モード (`memory` / `http`) の切替値が明示されている

推奨例:

```env
NEXT_PUBLIC_LEARNING_RECORD_API_MODE=http
NEXT_PUBLIC_LARAVEL_API_ORIGIN=http://localhost
```

## 3. API 契約 (最低限)

- [ ] `GET /api/health` のレスポンス仕様を確定した
- [ ] `GET /api/learning-progresses` のレスポンス仕様を確定した
- [ ] `POST /api/learning-progresses` のリクエスト/レスポンス仕様を確定した
- [ ] バリデーションエラーの返却形式を確定した

最低限の確認項目:

- [ ] 成功時の JSON 形式
- [ ] 失敗時の JSON 形式
- [ ] `Content-Type: application/json`

## 4. CORS とブラウザ疎通

- [ ] フロントオリジン (`http://localhost:3000`) が CORS 許可されている
- [ ] ブラウザ起点で `GET /api/health` が 200 を返す
- [ ] ブラウザ起点で `GET /api/learning-progresses` が 200 を返す

確認コマンド例:

```bash
curl -i -H 'Origin: http://localhost:3000' http://localhost/api/health
curl -i -H 'Origin: http://localhost:3000' http://localhost/api/learning-progresses
```

## 5. フロント API クライアント品質

- [ ] API 呼び出しを 1 箇所のサービス層に集約している
- [ ] `fetch` の呼び出しが安全に実装されている
- [ ] ネットワークエラー時に UI へ明確なエラーメッセージを出す
- [ ] 再試行操作 (Retry) を提供している
- [ ] 初回読み込み中の表示がある

注意事項 (今回の再発防止):

- [ ] `fetch` 参照の保持で `Illegal invocation` を起こさない実装になっている

## 6. UI 動作ゲート

- [ ] 初回表示で一覧取得が成功する
- [ ] 新規登録で件数が +1 される
- [ ] 更新で対象レコードが変更される
- [ ] 削除で対象レコードが消える
- [ ] 失敗時にエラーメッセージが表示される

## 7. テストゲート

- [ ] 既存のユニットテストがすべて通る
- [ ] API クライアントの基本テストが通る
- [ ] フォーム送信・一覧表示の主要テストが通る

確認コマンド例:

```bash
npm test
```

## 8. 着手判定

以下がすべて `Done` なら、バックエンド API の実装詳細に進んでよい:

- [ ] ディレクトリ誤りなし
- [ ] ポート競合なし
- [ ] 環境変数 OK
- [ ] CORS/疎通 OK
- [ ] UI の CRUD 最低動作 OK
- [ ] テスト OK

---

運用ルール:

- 毎回「0 -> 8」の順に確認する
- 1つでも未達なら先に修正する
- 新しい障害が出たら、このチェックリストに項目を追加して再発防止する
