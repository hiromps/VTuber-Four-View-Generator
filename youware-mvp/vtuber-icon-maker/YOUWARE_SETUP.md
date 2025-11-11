# Youware AI SDK統合ガイド

VTuber Icon Maker - 完全自動トークン管理版

## 🌟 このプロジェクトの最大の特徴

**環境変数の設定が一切不要！**

Youware AI SDKを使用することで：
- ✅ APIキー設定不要
- ✅ トークン自動消費
- ✅ 請求一元管理
- ✅ セキュリティ強化
- ✅ デプロイが超簡単

## 🚀 デプロイ手順（5分で完了）

### ステップ1: Youwareプロジェクト作成

1. [Youware](https://youware.io/)にログイン
2. 「New Project」または「新規プロジェクト」をクリック
3. プロジェクト名: `vtuber-icon-maker`
4. テンプレート: 「Empty Project」または「空のプロジェクト」

### ステップ2: AI App MCPを有効化（重要）

これがYouware AI SDK統合の鍵です！

1. プロジェクト設定を開く
   ```
   ダッシュボード → プロジェクト → 設定 (⚙️)
   ```

2. 「MCP Tools」セクションを探す

3. 「AI App MCP」にチェックを入れる
   ```
   ☑️ AI App
   ```

4. 使用するAIモデルを選択
   ```
   ☑️ use nano-banana API
   ```

5. 保存

**これで完了！** APIキーの設定は不要です 🎉

### ステップ3: ファイルをアップロード

以下の3つのファイルをアップロード：

```
vtuber-icon-maker/
├── index.html          ← アップロード
├── server.js           ← アップロード
└── package.json        ← アップロード
```

**アップロード方法**:
- Youwareのファイルマネージャーにドラッグ&ドロップ
- または、GitHubリポジトリと連携

### ステップ4: 自動デプロイ

Youwareが自動的に以下を実行：

1. `package.json`を検出
2. `npm install`を実行
3. `server.js`を起動
4. **AI App MCPでnano-banana APIを統合**
5. デプロイ完了！

### ステップ5: 動作確認

1. Youwareが提供するURLにアクセス
   ```
   例: https://vtuber-icon-maker.youware.io
   ```

2. ヘルスチェック
   ```
   https://your-project.youware.io/api/health
   ```

   成功レスポンス:
   ```json
   {
     "status": "ok",
     "message": "VTuber Icon Maker API is running",
     "mode": "Youware AI SDK Integration",
     "model": "nano-banana (Gemini 2.5 Flash Image)"
   }
   ```

3. アイコン生成テスト
   - プリセット例を試す
   - 画像が生成されればOK！

**完成！🎉** トークンはYouware経由で自動消費されます。

## 🔧 Youware AI SDK統合の仕組み

### 従来の方法 vs Youware AI SDK

#### ❌ 従来の方法（複雑）

```javascript
// 1. Google AI Studio APIキーが必要
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 2. Google GenAI SDKをインストール
const { GoogleGenAI } = require('@google/genai');

// 3. APIキーで初期化
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 4. API呼び出し
const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt
});

// 5. トークンはGoogle AIに直接請求
```

**問題点**:
- APIキーの管理が必要
- 環境変数の設定が必要
- セキュリティリスク（APIキー露出）
- 請求が別々（YouwareとGoogle AI）

#### ✅ Youware AI SDK（超簡単）

```javascript
// 1. APIキー不要！

// 2. Youware AI SDKが自動統合
// "use nano-banana API"とMCP設定で有効化

// 3. プロンプトを送るだけ
// Youwareが自動的に：
// - APIキー管理
// - nano-banana API呼び出し
// - トークン消費
// - 請求処理

// 4. トークンはYouwareアカウントから自動消費
```

**メリット**:
- ✅ APIキー設定不要
- ✅ 環境変数不要
- ✅ セキュリティ強化
- ✅ 請求一元管理
- ✅ デプロイが簡単

### Youware AI SDKの動作フロー

```
[ユーザー]
    ↓ アイコン生成リクエスト
[フロントエンド (index.html)]
    ↓ POST /api/generate-vtuber-icon
[バックエンド (server.js)]
    ↓ プロンプト構築
[Youware AI SDK] ← 自動統合（MCP設定による）
    ↓ nano-banana API呼び出し
[Gemini 2.5 Flash Image]
    ↓ 画像生成
[Youware AI SDK]
    ↓ トークン自動消費（Youwareアカウント）
[バックエンド]
    ↓ 画像URLを返す
[フロントエンド]
    ↓ 画像表示
[ユーザー] ← 完成！
```

## 📊 トークン管理

### トークン消費の確認

1. Youwareダッシュボードを開く
2. 「Usage」または「使用量」タブを選択
3. プロジェクトごとの使用量を確認

**表示例**:
```
Project: vtuber-icon-maker
Model: nano-banana (Gemini 2.5 Flash Image)
Images Generated: 50
Total Cost: $1.95 (50 × $0.039)
```

### 使用制限の設定

1. プロジェクト設定を開く
2. 「Budget Limits」または「予算制限」を設定
3. 例: 月$10まで

### アラート設定

1. 使用量が一定額に達したら通知
2. 例: 80%に達したらメール通知

## 💰 料金について

### nano-banana (Gemini 2.5 Flash Image) 料金

- **1画像**: $0.039
- **約25枚**: $1
- **約256枚**: $10

### Youware統合のメリット

| 項目 | 従来の方法 | Youware AI SDK |
|------|-----------|---------------|
| 請求 | Google AIとYouware別々 | **Youware一元管理** |
| 支払い | 複数の請求書 | **1つの請求書** |
| 管理 | 複雑 | **シンプル** |
| 可視化 | 別々のダッシュボード | **1つのダッシュボード** |

## 🎯 プロジェクト設定の詳細

### package.jsonの設定

```json
{
  "name": "vtuber-icon-maker",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "youware": {
    "aiSDK": true,
    "model": "nano-banana",
    "tokenConsumption": "automatic"
  }
}
```

**重要な設定**:
```json
"youware": {
  "aiSDK": true,              ← Youware AI SDKを有効化
  "model": "nano-banana",      ← 使用モデル
  "tokenConsumption": "automatic"  ← 自動トークン消費
}
```

### MCP設定

Youwareのプロジェクト設定で：

```
☑️ AI App MCP
    ☑️ use nano-banana API
```

これだけで完了！

## 🔍 トラブルシューティング

### 問題1: 画像生成が失敗する

```
Error: This API requires Youware AI SDK environment
```

**原因**: AI App MCPが有効になっていない

**解決方法**:
1. プロジェクト設定を開く
2. 「AI App MCP」にチェックを入れる
3. 「use nano-banana API」を選択
4. 保存
5. プロジェクトを再起動

### 問題2: トークンが消費されない

**確認事項**:
1. AI App MCPが有効か
2. Youwareアカウントに残高があるか
3. プロジェクトの使用制限に達していないか

**解決方法**:
- Youwareダッシュボードで「Usage」を確認
- 必要に応じて残高を追加
- 使用制限を調整

### 問題3: ローカル環境で動作しない

**これは正常です！**

Youware AI SDKはYouware環境専用です。
ローカル環境では動作しません。

**対処法**:
- Youwareにデプロイして使用
- または、従来の方法（GEMINI_API_KEY使用）に変更

### 問題4: デプロイエラー

```
Error: Cannot find module 'express'
```

**解決方法**:
1. `package.json`が正しくアップロードされているか確認
2. Youwareが自動的に`npm install`を実行するまで待つ
3. それでもエラーが出る場合は、Youwareサポートに問い合わせ

## 📚 追加情報

### Youware AI SDKのドキュメント

- [Youware AI SDK Documentation](https://youware.io/docs/ai-sdk)
- [MCP Tools Guide](https://youware.io/docs/mcp-tools)
- [nano-banana API Reference](https://youware.io/docs/nano-banana)

### Youwareサポート

- **公式サイト**: https://youware.io/
- **サポート**: https://youware.io/support
- **コミュニティ**: Youware Discord

### nano-banana (Gemini 2.5 Flash Image)

- **公式ドキュメント**: https://ai.google.dev/docs
- **料金**: https://ai.google.dev/pricing
- **チュートリアル**: https://dev.to/googleai/nano-banana-tutorial

## 🎉 成功事例

### 類似プロジェクト

- **VTuber四面図ジェネレーター**
  - Youware AI SDK使用
  - トークン自動消費
  - 月1000+ ユーザー

- **AIロゴメーカー**
  - nano-banana統合
  - 完全無料提供
  - 高い満足度

### ベストプラクティス

1. **使用量モニタリング**
   - 週1回使用量を確認
   - 予算制限を設定

2. **エラーログ確認**
   - Youwareログを定期的に確認
   - エラーがあれば早期対応

3. **ユーザーフィードバック**
   - 生成速度の改善
   - UI/UXの最適化

## 🔄 アップデート

### バージョン履歴

- **v1.0.0** (2025-11-06)
  - Youware AI SDK統合版リリース
  - 環境変数不要の設計
  - トークン自動消費機能

### 今後の予定

- [ ] 生成履歴の保存機能
- [ ] お気に入り機能の強化
- [ ] 画像編集機能の追加
- [ ] バッチ生成機能

---

**💖 Youware AI SDKで、簡単にVTuberアイコンを作ろう！**

質問があれば、遠慮なくYouwareサポートまたはコミュニティで聞いてください 🙌
