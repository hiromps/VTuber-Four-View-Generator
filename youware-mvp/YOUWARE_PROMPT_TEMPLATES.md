# Youware最適化プロンプトテンプレート集

Youwareで効率的にアプリを構築するための実践的なプロンプトテンプレート集

## 📋 目次

1. [基本構造](#基本構造)
2. [プロジェクト初期化](#プロジェクト初期化)
3. [UI/フロントエンド開発](#uiフロントエンド開発)
4. [バックエンド/API開発](#バックエンドapi開発)
5. [AI機能統合](#ai機能統合)
6. [画像生成アプリ](#画像生成アプリ)
7. [データベース統合](#データベース統合)
8. [デプロイメント](#デプロイメント)
9. [ベストプラクティス](#ベストプラクティス)

---

## 基本構造

### Youwareプロンプトの3要素

```
1. 【目的】: 何を作りたいか明確に記述
2. 【機能】: 必要な機能を箇条書き
3. 【技術】: 使用するAPI/ツールを指定
```

### 基本テンプレート

```markdown
【目的】
[アプリの目的を1-2文で記述]

【機能】
- [機能1]
- [機能2]
- [機能3]

【技術スタック】
- フロントエンド: [React/Vue/Vanilla JS]
- バックエンド: [Node.js/Express]
- AI/API: [使用するMCPツール]

【デザイン要件】
- [スタイル/テーマの指定]
```

---

## プロジェクト初期化

### 🎯 シンプルなWebアプリ

```
VTuber四面図ジェネレーターを作成してください。

【機能】
- 立ち絵画像をアップロード
- front/back/left/rightの4方向の画像を自動生成
- 生成された4枚の画像を横並びで表示
- 画像をPNG形式でダウンロード

【技術】
- use nano-banana API for image generation
- シンプルなHTML/CSS/JavaScriptで実装
- レスポンシブデザイン対応

【UI/UX】
- モダンでクリーンなデザイン
- ドラッグ&ドロップでファイルアップロード
- 生成中はローディングアニメーション表示
```

### 🎯 フルスタックアプリ

```
AIチャットボット付きメモアプリを作成してください。

【フロントエンド】
- React + Tailwind CSS
- メモの作成・編集・削除
- リアルタイムAIアシスタント機能

【バックエンド】
- Node.js + Express
- RESTful API
- メモデータの永続化

【AI機能】
- use Gemini API for chat assistance
- メモの内容を要約する機能
- 文章の改善提案機能

【環境変数】
- GEMINI_API_KEY: Google AI Studio APIキー
```

---

## UI/フロントエンド開発

### 🎨 UI改善プロンプト

```
現在のUIを改善してください：

【改善点】
1. カラースキームをモダンに変更
   - プライマリカラー: #6366f1 (indigo)
   - セカンダリカラー: #8b5cf6 (purple)
   - 背景: グラデーション背景

2. レイアウトを調整
   - ヘッダーを固定
   - コンテンツエリアを中央配置
   - カードデザインで各セクションを分離

3. アニメーション追加
   - ボタンホバーエフェクト
   - ページ遷移時のフェードイン
   - ローディングスピナー

【参考デザイン】
- Material Design 3
- Glassmorphism スタイル
```

### 🎨 レスポンシブ対応

```
このアプリをモバイルフレンドリーにしてください：

【対応内容】
- スマートフォン (320px~)
- タブレット (768px~)
- デスクトップ (1024px~)

【調整項目】
- フォントサイズの最適化
- ボタン/タップ領域の拡大
- 横スクロールの除去
- ナビゲーションをハンバーガーメニューに変更（モバイル時）

【テスト】
- iPhone SE, iPhone 14 Pro, iPad, デスクトップで表示確認
```

### 🎨 コンポーネント作成

```
再利用可能なUIコンポーネントを作成してください：

【コンポーネント一覧】
1. Button
   - variants: primary, secondary, outline, ghost
   - sizes: sm, md, lg
   - loading state対応

2. Card
   - ヘッダー、ボディ、フッター
   - hover効果
   - shadow/border variants

3. Modal
   - open/close アニメーション
   - backdrop click で閉じる
   - Escape キーで閉じる

【スタイル】
- Tailwind CSS使用
- ダークモード対応
- アクセシビリティ考慮（ARIA属性）
```

---

## バックエンド/API開発

### 🔧 RESTful API

```
以下の仕様でRESTful APIを実装してください：

【エンドポイント】
POST /api/images/generate
- 説明: 画像を生成
- リクエスト: { prompt: string, aspectRatio?: string }
- レスポンス: { imageUrl: string, id: string }

GET /api/images/:id
- 説明: 生成済み画像を取得
- レスポンス: { imageUrl: string, prompt: string, createdAt: string }

DELETE /api/images/:id
- 説明: 画像を削除

【技術】
- Express.js
- use nano-banana API
- エラーハンドリング実装
- リクエストバリデーション（express-validator）

【環境変数】
- GEMINI_API_KEY
- PORT (default: 3000)
```

### 🔧 認証機能

```
JWT認証システムを実装してください：

【機能】
- ユーザー登録 (POST /api/auth/register)
- ログイン (POST /api/auth/login)
- トークン更新 (POST /api/auth/refresh)
- ログアウト (POST /api/auth/logout)

【セキュリティ】
- パスワードはbcryptでハッシュ化
- JWT トークン（有効期限: 1時間）
- Refresh トークン（有効期限: 7日間）
- レート制限（express-rate-limit）

【保護されたルート】
- middleware: verifyToken
- 全ての /api/protected/* ルートに適用
```

---

## AI機能統合

### 🤖 Nano-Banana画像生成

```
nano-bananaを使った画像生成機能を実装してください：

【機能】
- テキストプロンプトから画像生成
- use nano-banana API (gemini-2.5-flash-image)
- アスペクト比指定可能（1:1, 16:9, 9:16, 4:3, 3:4）
- 生成画像をPNG形式で保存

【UIフロー】
1. ユーザーがプロンプトを入力
2. 「Generate」ボタンをクリック
3. ローディング表示（推定時間: 5-10秒）
4. 生成された画像を表示
5. ダウンロードボタンを表示

【エラーハンドリング】
- APIキー未設定エラー
- 生成失敗時のリトライ機能（最大3回）
- ユーザーフレンドリーなエラーメッセージ

【環境変数】
- GEMINI_API_KEY: 必須
```

### 🤖 チャット機能

```
AIチャット機能を追加してください：

【機能】
- use Gemini API for conversational AI
- メッセージ履歴の保持
- ストリーミングレスポンス（リアルタイム表示）
- コード表示用のシンタックスハイライト

【UI】
- チャット風のメッセージバブル
- ユーザーメッセージは右側（青）
- AIメッセージは左側（グレー）
- 入力欄は下部に固定
- スクロールは常に最新メッセージへ

【バックエンド】
POST /api/chat
- リクエスト: { message: string, conversationId?: string }
- レスポンス: Server-Sent Events (SSE) でストリーミング
```

### 🤖 画像認識・編集

```
画像認識と編集機能を実装してください：

【機能1】画像認識
- 画像をアップロード
- use Gemini API (vision model)
- 画像の内容を自動で説明
- 検出されたオブジェクトをリスト表示

【機能2】画像編集
- use nano-banana API
- 元画像を参考に編集
- プロンプト例: "この猫を犬に変えて", "背景を削除"
- before/after 比較表示

【実装】
- 複数画像の一括処理
- 処理進捗バーの表示
- 編集履歴の保存
```

---

## 画像生成アプリ

### 🎨 AIアートジェネレーター

```
AIアート生成アプリを作成してください：

【コアフィーチャー】
- use nano-banana API
- プロンプトテンプレート集（アニメ、フォト、抽象画など）
- プロンプト履歴の保存
- ギャラリー機能（生成済み画像の一覧）

【プロンプトビルダー】
- スタイル選択: photorealistic, anime, watercolor, oil painting
- 被写体選択: portrait, landscape, object, abstract
- ムード選択: cheerful, dark, serene, dramatic
- 詳細設定: lighting, color palette, composition

【UI】
- 左サイド: プロンプト設定パネル
- 中央: 画像プレビュー（大きく表示）
- 右サイド: 生成履歴（サムネイル）

【追加機能】
- お気に入り機能
- SNSシェアボタン
- 画像編集（トリミング、フィルター）
```

### 🎨 ロゴジェネレーター

```
AIロゴ生成ツールを作成してください：

【入力フォーム】
- 会社名/ブランド名
- 業種（テクノロジー、飲食、医療など）
- カラーパレット（3色まで選択可能）
- スタイル（モダン、クラシック、ミニマル）

【生成ロジック】
- use nano-banana API
- プロンプト自動構築:
  "create a modern logo for [company] in [industry],
   using colors [colors], [style] style, vector graphics,
   clean design, white background"

【出力】
- 4つのバリエーションを同時生成
- 各バリエーションは異なるスタイル
- PNG形式（透過背景）とSVG形式で提供

【ダウンロード】
- 各サイズを選択可能: 512x512, 1024x1024, 2048x2048
- ZIP形式で一括ダウンロード
```

---

## データベース統合

### 💾 データベース設計

```
画像管理システムのデータベースを設計してください：

【テーブル設計】
1. users
   - id (UUID, primary key)
   - email (unique)
   - password_hash
   - created_at
   - updated_at

2. images
   - id (UUID, primary key)
   - user_id (foreign key → users.id)
   - prompt (text)
   - image_url (string)
   - aspect_ratio (string)
   - file_size (integer)
   - created_at

3. favorites
   - id (UUID, primary key)
   - user_id (foreign key)
   - image_id (foreign key)
   - created_at

【技術】
- PostgreSQL または SQLite
- ORM: Sequelize or Prisma
- マイグレーション管理

【インデックス】
- users.email
- images.user_id
- images.created_at
```

### 💾 ファイルストレージ

```
画像ストレージシステムを実装してください：

【保存方法】
オプション1: ローカルファイルシステム
- public/uploads/ ディレクトリに保存
- ファイル名: [timestamp]-[uuid].png
- サイズ制限: 10MB

オプション2: クラウドストレージ
- AWS S3 or Google Cloud Storage
- バケット名: youware-generated-images
- 署名付きURL発行（有効期限: 1時間）

【実装】
- multer でファイルアップロード処理
- 画像の自動リサイズ（Sharp library）
- 古い画像の自動削除（7日後）

【セキュリティ】
- ファイルタイプチェック（PNG, JPEG, WebPのみ）
- ウイルススキャン（オプション）
```

---

## デプロイメント

### 🚀 Youware デプロイ

```
このアプリをYouwareにデプロイしてください：

【デプロイ設定】
1. Enable AI App MCP in Create Tab
2. Enable Backend functionality (Pro/Ultra plan required)

【環境変数】
Youware Project Settings → Environment Variables:
- GEMINI_API_KEY: [Google AI Studio APIキー]
- NODE_ENV: production
- PORT: 3000 (自動設定される場合あり)

【ファイル構造】
- index.html (フロントエンド)
- server.js (バックエンド)
- package.json (依存関係)
- .env.example (テンプレート)

【デプロイ後の確認】
1. ヘルスチェック: GET /api/health
2. 生成テスト: 簡単なプロンプトで画像生成
3. エラーログ確認: Youware Logs panel
```

### 🚀 本番環境最適化

```
本番環境向けに最適化してください：

【パフォーマンス】
- 静的ファイルのキャッシュ（Cache-Control headers）
- Gzip圧縮有効化
- 画像の遅延読み込み（lazy loading）
- CDN使用（静的アセット配信）

【セキュリティ】
- helmet.js でセキュリティヘッダー設定
- CORS設定（許可するオリジンを制限）
- レート制限（express-rate-limit）
- 入力サニタイゼーション

【監視】
- エラーログ収集（Winston logger）
- API使用量の追跡
- レスポンスタイム計測

【環境変数チェック】
- 起動時に必須環境変数を検証
- 不足している場合は明確なエラーメッセージ
```

---

## ベストプラクティス

### ✅ 効果的なプロンプトの書き方

#### 1. 具体的に記述する

❌ **悪い例**:
```
画像生成アプリを作って
```

✅ **良い例**:
```
nano-bananaを使った画像生成アプリを作成してください。

【機能】
- テキスト入力フィールド
- アスペクト比選択（1:1, 16:9, 4:3）
- 「Generate」ボタン
- 生成画像のプレビュー表示
- PNG形式でダウンロード

【UI】
- モダンでシンプルなデザイン
- Tailwind CSS使用
- レスポンシブ対応

【技術】
- use nano-banana API (gemini-2.5-flash-image)
- Node.js バックエンド
```

#### 2. 段階的に構築する

**フェーズ1**: 基本機能
```
まず、シンプルな画像生成機能を実装してください：
- プロンプト入力
- nano-banana APIで画像生成
- 結果を表示
```

**フェーズ2**: UI改善
```
UIを改善してください：
- カードデザイン採用
- ローディングアニメーション追加
- エラーメッセージの表示改善
```

**フェーズ3**: 追加機能
```
以下の機能を追加してください：
- 生成履歴の保存
- お気に入り機能
- 画像編集（基本的なフィルター）
```

#### 3. 使用するツールを明示する

```
【必須ツール】
- use nano-banana API (画像生成)
- use Gemini API (チャット機能)

【ライブラリ】
- Tailwind CSS (スタイリング)
- Axios (HTTP client)
- React Toastify (通知)

【バックエンド】
- Express.js
- CORS middleware
- dotenv (環境変数)
```

### ✅ トラブルシューティングプロンプト

```
以下のエラーが発生しています。修正してください：

【エラー内容】
[エラーメッセージをコピペ]

【発生状況】
- どの操作で発生するか
- エラーが出るタイミング
- 再現手順

【環境】
- Node.js バージョン
- 使用しているブラウザ
- Youware プラン（Free/Pro/Ultra）

【期待される動作】
[本来どう動作すべきか]
```

### ✅ コードレビュープロンプト

```
以下の観点でコードをレビューして改善してください：

【チェック項目】
1. セキュリティ
   - SQL injection対策
   - XSS対策
   - APIキーの安全な管理

2. パフォーマンス
   - 不要なAPI呼び出しの削減
   - データベースクエリの最適化
   - キャッシュの活用

3. コード品質
   - 適切なエラーハンドリング
   - コメントの追加
   - 関数の責務分離

4. ユーザビリティ
   - ローディング状態の表示
   - エラーメッセージの改善
   - 操作フィードバック
```

---

## 🎯 実践例：完全なプロジェクト

### AIポストカードジェネレーター

```
AIで旅行先のポストカードを生成するアプリを作成してください。

【プロジェクト概要】
ユーザーが旅行先の名前を入力すると、その場所のビンテージ風水彩画と
パーソナライズされたメッセージを含むポストカードを生成します。

【フロントエンド機能】
1. 入力フォーム
   - 旅行先（必須）
   - メッセージ（任意、最大200文字）
   - スタイル選択: Vintage, Modern, Watercolor, Sketch

2. ポストカードプレビュー
   - 生成された画像を表示
   - メッセージをオーバーレイ表示
   - リアルタイムプレビュー

3. ダウンロード機能
   - PNG形式（1200x800px）
   - 高解像度オプション（2400x1600px）

【バックエンドAPI】
POST /api/postcard/generate
- Input: { location: string, message?: string, style: string }
- use nano-banana API
- プロンプト構築例:
  "Create a [style] illustration of [location],
   vintage postcard style, beautiful scenery,
   travel destination, artistic, detailed"

【UI/UX】
- ポストカード風のデザイン
- 切手デザインの装飾要素
- アニメーション: カード生成時にフリップ効果
- カラースキーム: アンティークな暖色系

【技術スタック】
- フロントエンド: React + Tailwind CSS
- バックエンド: Node.js + Express
- AI: nano-banana (gemini-2.5-flash-image)
- 画像処理: Canvas API (メッセージのオーバーレイ用)

【追加機能】
- 生成したポストカードのギャラリー
- SNSシェア機能（Twitter, Instagram）
- ポストカードのカスタマイズ（フォント、色）

【環境変数】
- GEMINI_API_KEY: Google AI Studio APIキー
- PORT: 3000

【デプロイ】
Youwareにデプロイし、パブリックURLを生成してください。
```

---

## 📚 プロンプトライブラリ

### クイックスタート用プロンプト

#### 1. シンプルな画像生成UI
```
nano-bananaを使ったシンプルな画像生成UIを作成。
入力欄、生成ボタン、画像表示エリアのみ。
```

#### 2. チャットボット
```
Gemini APIを使ったチャットボットを作成。
メッセージ送信、履歴表示、クリアボタン付き。
```

#### 3. ファイルアップローダー
```
画像アップロード機能を実装。
ドラッグ&ドロップ対応、プレビュー表示、
サイズ制限10MB。
```

### カスタマイズ用プロンプト

#### デザイン変更
```
UIをダークモードに対応させてください。
トグルスイッチでライト/ダークを切り替え。
```

#### 機能追加
```
[既存機能] に [新機能] を追加してください。
[既存のコードとの整合性を保つ]
```

#### バグ修正
```
[機能名] で [問題] が発生しています。
原因を特定して修正してください。
```

---

## 🔗 参考リンク

- [Youware公式](https://www.youware.com)
- [Nano-Banana Tutorial](https://dev.to/googleai/how-to-build-with-nano-banana-complete-developer-tutorial-646)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)

---

## 💡 Tips

### Youware特有の機能

1. **MCP統合**: "use [tool name] API" で自動統合
2. **自然言語**: コードを書かずに機能を実装可能
3. **Vibe Coding**: デザインの雰囲気を伝えるだけでUI生成
4. **ワンクリックデプロイ**: ビルド・デプロイが自動化

### プロンプトのコツ

- ✅ 箇条書きで明確に
- ✅ 技術スタックを明示
- ✅ UI/UX要件を具体的に
- ✅ エラーハンドリングを忘れずに
- ✅ 段階的に機能追加

### よくある間違い

- ❌ 曖昧な指示（"いい感じに"）
- ❌ 一度に大量の機能を要求
- ❌ 技術的な詳細を省略
- ❌ エラー処理を考慮しない

---

**Happy Coding with Youware! 🚀✨**
