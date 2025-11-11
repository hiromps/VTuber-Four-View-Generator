# Nano-Banana 画像生成コンソール

Youware AI SDK（Google Gemini 2.5 Flash Image）を使用した画像生成CLIツール

## 🍌 Nano-Bananaとは

Nano-Bananaは**Gemini 2.5 Flash Image**モデルの愛称で、Google AIの最新の画像生成・編集モデルです。

- **高速生成**: テキストプロンプトから数秒で高品質な画像を生成
- **コスト効率**: $0.039/画像（約25枚/$1）
- **多様な用途**: イラスト、写真、コンセプトアート、デザインなど

## 📋 必要要件

- Node.js 18.0.0以上
- Google AI Studio APIキー（無料で取得可能）

## 🚀 セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. APIキーの設定

#### APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. "Create API Key"をクリック
4. 生成されたAPIキーをコピー

#### .envファイルの設定

`.env`ファイルを開き、取得したAPIキーを設定してください：

```env
GEMINI_API_KEY=あなたの実際のAPIキー
```

## 💻 使用方法

### 基本的な使い方

```bash
# 直接実行
node generate-image.js "プロンプト"

# npm scriptを使用
npm run generate "プロンプト"
```

### オプション

| オプション | 短縮形 | 説明 | 例 |
|-----------|-------|------|-----|
| `--output` | `-o` | 出力ファイル名を指定 | `--output cat.png` |
| `--aspect-ratio` | `-a` | アスペクト比を指定 | `--aspect-ratio 16:9` |
| `--help` | `-h` | ヘルプを表示 | `--help` |

### 使用例

#### 基本的な画像生成

```bash
node generate-image.js "a cute orange cat sitting on a couch"
```

出力: `generated_image_2025-11-05T12-30-00.png`

#### 出力ファイル名を指定

```bash
node generate-image.js "sunset over mountains" --output sunset.png
```

出力: `sunset.png`

#### アスペクト比を指定

```bash
node generate-image.js "landscape photography" --aspect-ratio 16:9 --output landscape.png
```

利用可能なアスペクト比:
- `1:1` (正方形)
- `16:9` (ワイド)
- `9:16` (縦長)
- `4:3` (標準)
- `3:4` (縦長標準)

#### npm scriptを使用

```bash
# ヘルプ表示
npm run generate:help

# 画像生成
npm run generate "a beautiful garden with flowers"
```

## 📝 プロンプトのコツ

### 効果的なプロンプトの書き方

1. **具体的に記述する**
   ```
   ❌ "a cat"
   ✅ "a fluffy orange cat with green eyes sitting on a red couch"
   ```

2. **スタイルを指定する**
   ```
   "photorealistic portrait of a person"
   "watercolor painting of a landscape"
   "anime style illustration of a character"
   ```

3. **詳細を追加する**
   ```
   "sunset over mountains, golden hour lighting, dramatic clouds, vivid colors"
   ```

4. **構図を指定する**
   ```
   "close-up portrait, centered composition"
   "wide-angle landscape, rule of thirds"
   ```

### プロンプト例集

```bash
# 写真風
node generate-image.js "photorealistic portrait of a woman with long black hair, natural lighting, professional photography"

# イラスト風
node generate-image.js "anime style illustration of a magical girl with pink hair, starry background"

# コンセプトアート
node generate-image.js "futuristic city skyline at night, cyberpunk style, neon lights, flying cars"

# 自然風景
node generate-image.js "serene mountain lake at sunrise, misty atmosphere, reflections on water"

# 抽象的
node generate-image.js "abstract geometric pattern with vibrant colors, modern minimalist design"
```

## 🔧 トラブルシューティング

### APIキーエラー

```
❌ エラー: GEMINI_API_KEY が設定されていません
```

**解決方法:**
1. `.env`ファイルが存在するか確認
2. `GEMINI_API_KEY`が正しく設定されているか確認
3. APIキーに余分なスペースや改行がないか確認

### 画像生成失敗

```
❌ 画像生成エラー: ...
```

**考えられる原因:**
- APIキーが無効または期限切れ
- プロンプトが不適切（ポリシー違反など）
- ネットワーク接続の問題
- APIの使用制限に達した

**解決方法:**
1. APIキーを再確認
2. プロンプトを変更してみる
3. インターネット接続を確認
4. Google AI Studioで使用状況を確認

### ファイル保存エラー

```
❌ ファイル保存エラー: ...
```

**解決方法:**
- 出力先ディレクトリの書き込み権限を確認
- ディスク容量を確認
- ファイル名に使用できない文字が含まれていないか確認

## 💰 料金情報

### Gemini 2.5 Flash Image 料金

- **画像生成**: $0.039 per image
- **コスト効率**: 約25枚/$1

### 無料枠

Google AI Studioでは、以下の無料枠が提供されています（2025年11月時点）:
- 毎月一定数の無料リクエスト
- 詳細は[Google AI Pricing](https://ai.google.dev/pricing)を参照

## 🔗 関連リンク

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Nano-Banana Tutorial](https://dev.to/googleai/how-to-build-with-nano-banana-complete-developer-tutorial-646)
- [Google AI Pricing](https://ai.google.dev/pricing)

## 📚 技術仕様

### 使用技術

- **モデル**: `gemini-2.5-flash-image` (Nano-Banana)
- **SDK**: `@google/genai` v1.27.0
- **ランタイム**: Node.js 18+
- **環境変数管理**: dotenv

### APIパラメータ

```javascript
{
  model: 'gemini-2.5-flash-image',
  contents: 'プロンプト',
  config: {
    responseModalities: ['Image'],
    temperature: 0.4,
    imageConfig: {
      aspectRatio: '16:9' // オプション
    }
  }
}
```

### 出力形式

- **デフォルト形式**: PNG
- **エンコーディング**: Base64 → Buffer → File
- **ファイル名**: `generated_image_[timestamp].png`

## 🤝 サポート

問題が発生した場合:
1. このドキュメントのトラブルシューティングセクションを確認
2. [Google AI Community](https://discuss.ai.google.dev/)で質問
3. プロジェクトのIssueを作成

## 📄 ライセンス

MIT License

---

**Happy Generating! 🎨🍌**
