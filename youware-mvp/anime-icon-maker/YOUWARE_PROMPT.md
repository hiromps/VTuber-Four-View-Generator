# Youware用プロジェクト作成プロンプト

このプロンプトをYouwareに貼り付けて使用できます。

---

## 📋 プロンプト（コピー＆ペースト用）

```
Shonen Icon Maker - 少年アニメ風AIアイコンジェネレーターを作成してください。

【プロジェクト概要】
Solo Leveling、Demon Slayer（鬼滅の刃）、Jujutsu Kaisen（呪術廻戦）、Chainsaw Man、
My Hero Academia、Brand Vision、The Apothecary Diariesなどの少年アニメスタイルで
プロフィールアイコンを生成するWebアプリ。

【主要機能】
1. キャラクター説明入力
   - テキストエリアでキャラクターの特徴を入力
   - プレースホルダー: "黒髪の少年、青い目、剣を持った戦士、クールな表情、稲妻のエフェクト"

2. アニメスタイル選択（8種類）
   - Solo Leveling（ダークファンタジー、影エフェクト）
   - Demon Slayer（鬼滅の刃 - 呼吸エフェクト、鮮やかな色彩）
   - Jujutsu Kaisen（呪術廻戦 - 呪力エフェクト、都会的）
   - Chainsaw Man（グリティ、カオティック）
   - My Hero Academia（ヒーロー、個性エフェクト）
   - Brand Vision（モダン、クリーン）
   - The Apothecary Diaries（薬屋のひとりごと - 中国宮廷風）
   - Generic Shonen（汎用少年アニメ）

3. 背景タイプ選択（5種類）
   - Dramatic（ドラマチック）
   - Solid Color（単色）
   - Gradient（グラデーション）
   - Action（アクション、モーションブラー）
   - Simple（シンプル）

4. AI画像生成
   - use nano-banana API (gemini-2.5-flash-image)
   - 1024x1024のプロフィールアイコン生成
   - 5-10秒で生成完了

5. 結果表示
   - 生成された画像を表示
   - ダウンロードボタン（PNG形式）
   - 再生成ボタン
   - Twitterシェアボタン
   - 使用したプロンプトを表示

6. プリセット例（4種類）
   - Shadow Monarch（Solo Leveling風）
   - 鬼殺隊剣士（鬼滅の刃風）
   - 呪術師（呪術廻戦風）
   - デビルハンター（チェンソーマン風）

【UI/UXデザイン】
- モダンでカッコいいデザイン
- カラースキーム: 紫のグラデーション（#667eea → #764ba2）
- フォント: Noto Sans JP
- レスポンシブデザイン（モバイル対応）
- ホバーエフェクト、アニメーション
- ローディング時のプログレスバー

【バックエンド実装】
POST /api/generate-icon
- リクエスト: { description, style, background }
- use nano-banana API (gemini-2.5-flash-image)
- プロンプト自動構築ロジック:
  ```
  Create a profile icon of [description],
  [style characteristics],
  [background type],
  anime art style, high quality illustration,
  portrait composition, face focus, upper body,
  perfect for social media profile picture,
  1024x1024 square format, centered composition,
  detailed facial features, expressive eyes,
  professional digital art
  ```
- レスポンス: { success, imageUrl, prompt, style, background, timestamp }

【アニメスタイル定義】
各スタイルの特徴をプロンプトに組み込む:
- Solo Leveling: dark fantasy, RPG game UI elements, glowing blue eyes, shadow effects
- Demon Slayer: Taisho era Japan, water/fire breathing effects, traditional patterns
- Jujutsu Kaisen: cursed energy effects, MAPPA animation style, urban setting
- Chainsaw Man: gritty art style, chaotic energy, blood effects, edgy atmosphere
- My Hero Academia: superhero costume, quirk effects, heroic pose, vibrant colors
- Brand Vision: clean modern design, minimalist aesthetic, bold colors
- The Apothecary Diaries: ancient Chinese palace, elegant traditional clothing
- Generic Shonen: dynamic action pose, vibrant colors, energy effects

【技術スタック】
- フロントエンド: HTML + Tailwind CSS + Vanilla JavaScript
- バックエンド: Node.js + Express
- AI: use nano-banana API (gemini-2.5-flash-image)
- 画像フォーマット: PNG (1024x1024)

【環境変数】
- GEMINI_API_KEY: Google AI Studio APIキー（必須）
- PORT: 3000（デフォルト）

【追加エンドポイント】
GET /api/health - ヘルスチェック
GET /api/styles - 利用可能なスタイル一覧
GET /api/backgrounds - 利用可能な背景一覧

【エラーハンドリング】
- APIキー未設定エラー
- 画像生成失敗時のリトライ提案
- ネットワークエラー時のメッセージ
- バリデーションエラー

【パフォーマンス】
- 生成時間: 5-10秒
- ローディング表示（スピナー + プログレスバー）
- ステップ表示（プロンプト構築中 → AI送信中 → 生成中 → 完成）

【ファイル構成】
- index.html: フロントエンド
- server.js: バックエンドAPI
- package.json: 依存関係
- .env.example: 環境変数テンプレート

【デプロイ】
Youwareにデプロイ:
1. バックエンド機能を有効化
2. 環境変数にGEMINI_API_KEYを設定
3. 自動デプロイ

以上の仕様でShonen Icon Makerを実装してください。
```

---

## 🚀 使い方

### 1. Youwareで新規プロジェクト作成

1. Youwareにログイン
2. 「New Project」または「新規プロジェクト」をクリック
3. プロジェクト名: `shonen-icon-maker`

### 2. プロンプトを貼り付け

1. 上記の「プロンプト」セクション全体をコピー
2. Youwareのプロンプト入力欄に貼り付け
3. 「Generate」または「生成」ボタンをクリック

### 3. 環境変数を設定

生成後、必ず以下の環境変数を設定：

```
GEMINI_API_KEY=あなたのGoogle AI Studio APIキー
```

### 4. デプロイ

Youwareが自動的にデプロイします。

---

## 💡 プロンプトのカスタマイズ

### アニメスタイルを追加

プロンプト内の「アニメスタイル選択」セクションに追加：

```
- [新しいアニメ名]（[特徴の説明]）
```

そして「アニメスタイル定義」セクションにも追加：

```
- [新しいアニメ名]: [visual characteristics]
```

### 背景タイプを追加

「背景タイプ選択」セクションに追加：

```
- [新しい背景名]（[説明]）
```

### UIカラーの変更

「UI/UXデザイン」セクションで変更：

```
- カラースキーム: [あなたの色1] → [あなたの色2]
```

---

## 🎯 期待される結果

プロンプトを実行すると、以下が自動生成されます：

1. **index.html**
   - 美しいUI
   - 8つのスタイルボタン
   - 5つの背景ボタン
   - プリセット例
   - ローディングアニメーション

2. **server.js**
   - Express サーバー
   - nano-banana API統合
   - プロンプト自動構築ロジック
   - 3つのAPIエンドポイント

3. **package.json**
   - 必要な依存関係
   - npm scripts

4. **動作するWebアプリ**
   - すぐに使える
   - 会員登録不要
   - 高品質なアイコン生成

---

## 🔧 トラブルシューティング

### Youwareがうまく生成できない場合

**方法1**: プロンプトを分割

1回目:
```
Shonen Icon Makerのフロントエンド（index.html）を作成してください。
[UI/UXデザイン]と[主要機能]の部分をコピー
```

2回目:
```
Shonen Icon Makerのバックエンド（server.js）を作成してください。
[バックエンド実装]と[技術スタック]の部分をコピー
```

**方法2**: GitHubから直接インポート

1. このプロジェクトをGitHubにプッシュ
2. Youwareで「Import from GitHub」を選択
3. リポジトリを選択

---

## 📚 参考情報

- **nano-banana (Gemini 2.5 Flash Image)**: https://ai.google.dev/docs
- **Google AI Studio**: https://aistudio.google.com/
- **Youware Documentation**: https://youware.io/docs

---

**⚡ 素晴らしいアニメアイコンジェネレーターを作りましょう！**
