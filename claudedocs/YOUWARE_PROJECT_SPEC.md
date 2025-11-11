# VTuber Four-View Generator - Youware用プロジェクト仕様書

このドキュメントは、VTuber Four-View Generatorプロジェクトの簡易版をYouwareで新規作成するための完全な仕様書です。

## プロジェクト概要

AI画像生成を活用したVTuberキャラクター制作支援Webアプリケーション。ユーザーは画像をアップロードするか、テキストプロンプトから以下を生成できます：

1. **キャラクター四面図** - 正面、背面、左側面、右側面の4枚
2. **表情差分** - 喜び、怒り、悲しみ、驚きの4枚
3. **コンセプトアート** - テキストから1枚の画像生成

**Youware独自のトークンシステム**を採用。トークン管理はYouwareプラットフォーム側で行い、画像生成するたびにYouwareトークンを消費します。ユーザー認証もYouwareプラットフォームが管理するため、独自の会員登録機能やトークン付与機能は不要です。

---

## 技術スタック

### フロントエンド
- **Next.js 15.5.2** (App Router)
- **React 18.3.1**
- **TypeScript 5.3.3**
- **TailwindCSS 3.4.1**

### バックエンド
- **Next.js API Routes**
- **Youware API** (ユーザー認証・トークン管理)
- **Supabase MCP** (PostgreSQL データベース - 画像生成履歴保存)
- **Youware トークンシステム** (プラットフォーム側で完全管理)

### AI API
- **Google Gemini 2.5 Flash Image** - 画像から画像生成 (四面図、表情差分)
- **Google Imagen 4.0** - テキストから画像生成 (コンセプトアート)

### 主要ライブラリ
```json
{
  "@google/genai": "^1.27.0",
  "@supabase/ssr": "^0.1.0",
  "@supabase/supabase-js": "^2.39.3",
  "jszip": "3.10.1"
}
```

**注**: Supabase MCPを使用しますが、クライアントライブラリ（`@supabase/supabase-js`）も必要です。

---

## 主要機能

### 1. ユーザー認証（Youware管理）
- **Youwareプラットフォームが認証を管理**
- アプリ側では独自の会員登録・ログイン機能は不要
- YowareからユーザーIDを受け取って使用

#### 実装方針
- Youwareから提供されるユーザーIDをセッションまたはリクエストヘッダーから取得
- 認証状態はYouware側で管理されるため、AuthModalやログイン画面は不要
- **Supabase MCPを使って画像生成履歴を保存**
- ユーザー識別はYouwareユーザーIDで管理

### 2. Youwareトークンシステム（プラットフォーム管理）
- **トークン管理はYouwareプラットフォーム側で実施**
- アプリ側でのトークン付与・管理機能は不要
- **画像生成するたびにYouware APIでトークンを消費**
- トークン消費量:
  - キャラクター四面図: 4トークン
  - 表情差分: 4トークン
  - コンセプトアート: 1トークン

#### 実装ファイル
- `lib/youware.ts` - Youware API統合

```typescript
export const TOKEN_COSTS = {
  CHARACTER_SHEET: 4,
  FACIAL_EXPRESSIONS: 4,
  CONCEPT_ART: 1,
}

// Youware APIクライアント
export class YouwareClient {
  // トークン残高取得（Youware APIを呼び出し）
  async getTokenBalance(youwareUserId: string): Promise<number>

  // トークン消費（Youware APIを呼び出し）
  async consumeTokens(youwareUserId: string, amount: number): Promise<boolean>

  // トークン残高チェック
  async hasEnoughTokens(youwareUserId: string, amount: number): Promise<boolean>
}
```

#### トークン管理の特徴
- **Youwareプラットフォームがトークンを完全管理**
- アプリ側のデータベースにトークン残高は保存しない
- 画像生成前にYouware APIでトークン残高をチェック
- 画像生成成功後にYouware APIでトークンを消費
- トークン不足時は生成処理を実行せずエラーを返す
- トークンの付与・購入はYouwareプラットフォーム側で管理

### 3. 画像生成機能

#### A. キャラクター四面図生成（画像生成時に4トークン消費）
**APIエンドポイント**: `POST /api/generate/sheet`

**入力パラメータ**:
```typescript
{
  base64Image: string,      // アップロードした画像 (Base64)
  mimeType: string,          // 'image/png' | 'image/jpeg' | 'image/webp'
  additionalPrompt?: string, // 追加の指示 (オプション)
  attachedImageBase64?: string,      // アイテム参照画像 (オプション)
  attachedImageMimeType?: string
}
```

**出力**:
```typescript
{
  images: {
    front: string,  // Data URL
    back: string,
    left: string,
    right: string
  },
  tokens: number    // 更新後のトークン残高
}
```

**実装ファイル**:
- `app/api/generate/sheet/route.ts`
- `services/geminiService.ts` - `generateCharacterSheetView()`

**使用モデル**: Google Gemini 2.5 Flash Image

**プロンプト例** (正面):
```
CRITICAL REQUIREMENT - YOU MUST APPLY THESE MODIFICATIONS: [追加指示].
Using the provided image of a character's front view, generate a high-quality,
clean illustration of the character's front view, but standardized in a T-pose
in the exact same art style, color palette, and character details. The character
should be in a neutral T-pose. The background must be a solid, neutral gray (#808080).
IMPORTANT: The ENTIRE character must be FULLY VISIBLE within the frame from head to toe.
```

#### B. 表情差分生成（画像生成時に4トークン消費）
**APIエンドポイント**: `POST /api/generate/expressions`

**入力パラメータ**: キャラクター四面図と同じ

**出力**:
```typescript
{
  images: {
    joy: string,      // 喜び
    anger: string,    // 怒り
    sorrow: string,   // 悲しみ
    surprise: string  // 驚き
  },
  tokens: number
}
```

**実装ファイル**:
- `app/api/generate/expressions/route.ts`
- `services/geminiService.ts` - `generateFacialExpression()`

**使用モデル**: Google Gemini 2.5 Flash Image

#### C. コンセプトアート生成（画像生成時に1トークン消費）
**APIエンドポイント**: `POST /api/generate/concept`

**入力パラメータ**:
```typescript
{
  prompt: string,                    // 生成プロンプト
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
}
```

**出力**:
```typescript
{
  imageUrl: string,  // Data URL
  tokens: number
}
```

**実装ファイル**:
- `app/api/generate/concept/route.ts`
- `services/geminiService.ts` - `generateConceptArt()`

**使用モデル**: Google Imagen 4.0

**プロンプト**:
```typescript
`award-winning digital illustration, masterpiece, ${prompt}`
```

### 4. プロンプト最適化機能
**APIエンドポイント**: `POST /api/enhance-prompt`

日本語の指示を英語のキーワードに変換し、AI画像生成に最適化します。

**実装ファイル**:
- `app/api/enhance-prompt/route.ts`
- `services/geminiService.ts` - `enhancePrompt()`

**使用モデル**: Google Gemini 2.0 Flash Lite

**例**:
- 入力: "髪色を金色に変えてください"
- 出力: "vibrant golden blonde hair"

### 5. 画像履歴機能
生成した画像をSupabase Storageに保存し、履歴として閲覧可能。

**APIエンドポイント**:
- `GET /api/history` - 履歴一覧取得
- `GET /api/history/[id]` - 個別履歴取得

**実装ファイル**:
- `lib/storage.ts` - `uploadImageToStorage()`, `saveImageHistory()`
- `components/HistoryModal.tsx`

### 6. 画像合成・シェア機能
4枚の画像を1枚の正方形グリッドに合成してTwitter(X)シェア用画像を生成。

**実装ファイル**:
- `lib/imageComposer.ts` - `composeGridImages()`

---

## データベーススキーマ (Supabase MCP)

### テーブル: `users`
```sql
-- Youwareユーザーとアプリ内データを紐付けるテーブル
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youware_user_id TEXT UNIQUE NOT NULL,  -- Youwareから提供されるユーザーID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Youwareユーザー用のインデックス
CREATE INDEX idx_users_youware_user_id ON public.users(youware_user_id);
```

**注**:
- トークン残高はYouwareプラットフォーム側で管理されるため、`tokens`カラムは不要です
- Supabase MCPを使ってテーブル作成・管理を行います

### テーブル: `generation_history`
```sql
-- 画像生成履歴テーブル（トークン消費の記録・統計用）
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  youware_user_id TEXT NOT NULL,
  generation_type TEXT NOT NULL,  -- 'character_sheet' | 'concept' | 'expressions'
  tokens_consumed INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,  -- プロンプトや設定などの追加情報
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックス
CREATE INDEX idx_generation_history_user ON public.generation_history(youware_user_id);
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_created ON public.generation_history(created_at DESC);
```

**注**:
- `balance_after`カラムは不要（残高はYouware側で管理）
- トークン消費の記録は監査・統計目的で使用
- 実際のトークン残高はYouware APIから取得
- Supabase MCPを使ってデータ操作を行います

### テーブル: `image_history`
```sql
-- 生成された画像の保存用テーブル（Supabase Storageと連携）
CREATE TABLE public.image_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  youware_user_id TEXT NOT NULL,
  generation_type TEXT NOT NULL,  -- 'character_sheet' | 'concept' | 'expressions'
  prompt TEXT,
  additional_prompt TEXT,
  aspect_ratio TEXT,
  images JSONB NOT NULL,  -- Supabase StorageのURL配列
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックス
CREATE INDEX idx_image_history_user ON public.image_history(user_id);
CREATE INDEX idx_image_history_youware_user ON public.image_history(youware_user_id);
CREATE INDEX idx_image_history_created ON public.image_history(created_at DESC);
```

**注**: Supabase MCPとSupabase Storageを使って画像を保存・管理します。

### 関数: Youwareユーザー識別
```sql
-- Youwareユーザーの初回アクセス時にユーザーレコードを自動作成
CREATE OR REPLACE FUNCTION public.get_or_create_user(p_youware_user_id TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 既存ユーザーをチェック
  SELECT id INTO v_user_id
  FROM public.users
  WHERE youware_user_id = p_youware_user_id;

  -- ユーザーが存在しない場合は新規作成
  IF v_user_id IS NULL THEN
    INSERT INTO public.users (youware_user_id)
    VALUES (p_youware_user_id)
    RETURNING id INTO v_user_id;
  END IF;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**使用例**（API内で呼び出し）:
```typescript
// Supabase MCPを使ってユーザーIDを取得または作成
const { data: userId } = await supabase.rpc('get_or_create_user', {
  p_youware_user_id: youwareUserId
});
```

**注**: トークン付与処理は不要（Youware側で管理）、Supabase MCPを使って関数を作成・実行します。

---

## 環境変数 (.env.local)

```bash
# Google Gemini API
API_KEY=your_gemini_api_key_here

# Supabase MCP（データベース・ストレージ）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Youware API設定
YOUWARE_API_URL=https://api.youware.com  # Youware APIのベースURL
YOUWARE_API_KEY=your_youware_api_key     # Youware API認証キー
YOUWARE_USER_HEADER=X-Youware-User-Id    # YowareからユーザーIDを受け取るヘッダー名

# アプリURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**注意**:
- **Supabase MCP**を使用してデータベース操作を行います
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`は不要（Supabase Authを使わないため）
- Youware API の具体的なURL、認証方式はYouwareプラットフォームの仕様に従ってください
- トークン管理のための`YOUWARE_TOKEN_INITIAL_AMOUNT`は不要（Youware側で管理）

---

## APIルート一覧

### ユーザー管理（Youware統合）
- `GET /api/user/profile` - ユーザープロフィール取得（YowareユーザーID経由）
- 認証エンドポイントは不要（Youware側で管理）

### トークン（Youware API経由）
- `GET /api/tokens` - トークン残高取得（Youware APIから取得）
- `GET /api/tokens/history` - 画像生成履歴取得（オプション）

### 画像生成（各エンドポイントでYouwareトークンを消費）
- `POST /api/generate/sheet` - 四面図生成（4トークン消費）
- `POST /api/generate/expressions` - 表情差分生成（4トークン消費）
- `POST /api/generate/concept` - コンセプトアート生成（1トークン消費）
- `POST /api/enhance-prompt` - プロンプト最適化

### 履歴
- `GET /api/history` - 画像生成履歴一覧
- `GET /api/history/[id]` - 個別履歴取得

### ユーザー
- `GET /api/user/profile` - ユーザープロフィール取得

---

## 主要コンポーネント構成

### ページ
- `app/page.tsx` - メインページ (画像生成UI)
- `app/layout.tsx` - レイアウト (Providers)

### コンポーネント
- `components/TokenDisplay.tsx` - Youwareトークン残高表示
- `components/HistoryModal.tsx` - 生成履歴モーダル
- `components/LanguageSwitcher.tsx` - 言語切り替え
- `components/Providers.tsx` - コンテキストプロバイダー
- 認証関連コンポーネントは不要（Youware側で管理）

### ユーティリティ
- `utils/imageUtils.ts` - 画像処理ユーティリティ
- `lib/imageComposer.ts` - 画像合成処理

---

## Gemini API使用方法

### 初期化
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});
```

### 画像から画像生成 (Gemini 2.5 Flash Image)
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: {
    parts: [
      {
        inlineData: {
          data: base64Image,      // Base64文字列
          mimeType: 'image/png'
        }
      },
      {
        text: "プロンプト"
      }
    ]
  },
  config: {
    responseModalities: [Modality.IMAGE]
  }
});

// レスポンスから画像を取得
const imageData = response.candidates[0].content.parts[0].inlineData;
const dataUrl = `data:${imageData.mimeType};base64,${imageData.data}`;
```

### テキストから画像生成 (Imagen 4.0)
```typescript
const response = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt: 'award-winning digital illustration, masterpiece, VTuber character',
  config: {
    numberOfImages: 1,
    outputMimeType: 'image/png',
    aspectRatio: '3:4'
  }
});

const imageBytes = response.generatedImages[0].image?.imageBytes;
const dataUrl = `data:image/png;base64,${imageBytes}`;
```

---

## 簡易化のための推奨事項 (Youware用)

### Youware環境の特徴
- **ユーザー認証はYouwareが管理** - 独自の会員登録・ログイン機能は不要
- **トークン管理はYouwareプラットフォームが完全管理** - アプリ側でのトークン残高管理・付与は不要
- **Supabase MCPが使える** - データベース・ストレージの管理にSupabase MCPを活用
- **Stripe決済は使用不可** - 外部決済システムは利用できません
- **Youware API統合** - トークン残高取得・消費はYouware API経由で実施
- **画像生成時にYouware APIでトークン消費** - 各生成処理でYouware APIを呼び出してトークンを消費
- **Supabase MCPで履歴管理** - 生成履歴と画像をSupabase MCPで保存
- **YowareユーザーIDでの統合** - プラットフォームから提供されるユーザーIDを使用
- **初回無料トークン不要** - トークンの付与・購入はYouware側で管理

### 削除可能な機能 (基本機能に集中)
1. **独自の認証機能全体** - Youwareがユーザー認証を管理
   - Supabase Auth（マジックリンク認証）
   - AuthModal、ログイン画面
   - `/api/auth/*` エンドポイント
2. **独自のトークン管理機能全体** - Youwareプラットフォームがトークンを完全管理
   - 初回無料トークン付与機能
   - ローカルDBでのトークン残高管理
   - トークン付与・追加機能
   - `users.tokens`カラム
   - `transactions`テーブル（またはシンプルな履歴テーブルに変更）
3. **Stripe決済機能全体** - Youware側でトークン購入を管理
   - チェックアウト、Webhook
   - トークン購入機能
   - 購入履歴管理
4. **表情差分生成機能** - 四面図のみに絞る（オプション）
5. **画像履歴機能** - Supabase Storageへの保存を省略（オプション）
6. **画像合成・シェア機能** - Twitterシェアを省略（オプション）
7. **プロンプト最適化機能** - ユーザーが直接英語で入力（オプション）
8. **言語切り替え** - 英語または日本語のみ（オプション）

### 簡易実装案

#### フェーズ1: 最小機能（Youware向け）
- YowareユーザーIDの取得
- Youware API統合（トークン残高取得・消費）
- 画像生成前のYouwareトークン残高チェック
- 四面図生成のみ（4トークン消費）
- 画像生成成功後のYouware APIトークン消費処理

#### フェーズ2: 拡張
- コンセプトアート生成（1トークン消費）
- トランザクション履歴表示
- エラーハンドリングの強化

#### フェーズ3: 高度機能
- 表情差分生成（4トークン消費）
- 画像履歴
- プロンプト最適化

### Youwareトークン管理の実装方針（Supabase MCP統合）
```typescript
// Youware API + Supabase MCP統合フロー
async function generateImage(youwareUserId: string, type: string, params: any) {
  const youwareClient = new YouwareClient();
  const cost = TOKEN_COSTS[type];

  // 1. Youware APIでトークン残高チェック
  const hasEnough = await youwareClient.hasEnoughTokens(youwareUserId, cost);
  if (!hasEnough) {
    throw new Error('トークンが不足しています');
  }

  // 2. Supabase MCPでユーザーIDを取得または作成
  const { data: userId } = await supabase.rpc('get_or_create_user', {
    p_youware_user_id: youwareUserId
  });

  // 3. 画像生成処理
  const result = await generateImageWithAI(params);

  // 4. Youware APIでトークン消費（成功時のみ）
  const consumed = await youwareClient.consumeTokens(youwareUserId, cost);
  if (!consumed) {
    throw new Error('トークン消費に失敗しました');
  }

  // 5. Supabase MCPで生成履歴を記録
  await supabase.from('generation_history').insert({
    user_id: userId,
    youware_user_id: youwareUserId,
    generation_type: type,
    tokens_consumed: cost,
    success: true,
    metadata: params
  });

  // 6. (オプション) Supabase Storageに画像を保存
  // await uploadImageToStorage(result.images);

  return result;
}
```

**重要**:
- トークン残高はYouware APIから取得・消費
- 生成履歴はSupabase MCPで管理
- 画像保存はSupabase Storageを使用（推奨）


---

## 実装の流れ (Youwareでの作成手順)

### 1. プロジェクトセットアップ
```bash
npx create-next-app@latest vtuber-generator --typescript --tailwind --app
cd vtuber-generator
npm install @google/genai @supabase/supabase-js jszip
```

**注意**: Youwareでは`@stripe/stripe-js`と`stripe`パッケージは**不要**です。

### 2. Supabase MCP セットアップ
- Supabaseプロジェクト作成
- Supabase MCPを使ってテーブル作成
  - `users`テーブル
  - `generation_history`テーブル
  - `image_history`テーブル
  - `get_or_create_user`関数
- 環境変数設定（`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`）

### 3. Google Gemini APIキー取得
- Google AI Studioでキー作成
- 環境変数設定

### 4. 実装順序（Youware向け）
1. **Supabase MCP統合** (`lib/supabase.ts`)
   - Supabaseクライアントの初期化
   - テーブル作成（`users`, `generation_history`, `image_history`）
   - `get_or_create_user`関数の作成
2. **Youware API統合** (`lib/youware.ts`)
   - YowareユーザーIDの取得処理（ヘッダーまたはセッションから）
   - Youware APIクライアントの実装
   - トークン残高取得機能（Youware API呼び出し）
   - トークン消費機能（Youware API呼び出し）
3. **画像生成APIの実装** (`services/geminiService.ts`, `/api/generate/sheet`)
   - Gemini APIによる四面図生成
   - 生成前のYouware APIトークン残高チェック
   - 生成成功後のYouware APIトークン消費（4トークン）
   - Supabase MCPで生成履歴を記録
4. **UI統合** (`app/page.tsx`)
   - Youware APIからトークン残高取得して表示
   - 生成ボタンのトークン不足時の無効化
   - 生成履歴の表示（Supabase MCPから取得）
5. **(推奨) Supabase Storageへの画像保存**
   - 生成画像のアップロード
   - `image_history`テーブルへの保存
6. **(オプション) コンセプトアート生成**（1トークン消費）
7. **(オプション) 表情差分生成**（4トークン消費）

---

## セキュリティ考慮事項

### Youwareユーザー認証
- **Youwareから提供されるユーザーIDの検証**
- リクエストヘッダーまたはセッションからユーザーIDを取得
- ユーザーIDの改ざん防止（Youware側で署名検証される想定）
- 不正なユーザーIDでのアクセスを拒否

### Row Level Security (RLS) - Supabase MCP
- **全テーブルでRLS有効化**（Supabase MCPで設定）
- ユーザーは自分のデータのみアクセス可能
- Youware IDでのフィルタリング

```sql
-- generation_historyテーブルのRLSポリシー例
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generation history"
  ON public.generation_history
  FOR SELECT
  USING (youware_user_id = current_setting('app.youware_user_id', true));

CREATE POLICY "Users can insert own generation history"
  ON public.generation_history
  FOR INSERT
  WITH CHECK (youware_user_id = current_setting('app.youware_user_id', true));
```

**注**: Supabase MCPを使ってRLSポリシーを設定します。

### API保護
- 全生成APIでYouwareユーザーID検証必須
- **画像生成前のトークン残高チェック必須**
- トークン消費処理のトランザクション管理

### Youwareトークンセキュリティ
```typescript
// Youware API経由の安全なトークン消費実装例
async function safeConsumeTokens(youwareUserId: string, type: string) {
  const youwareClient = new YouwareClient();
  const cost = TOKEN_COSTS[type];

  try {
    // 1. Youware APIで残高チェック
    const hasEnough = await youwareClient.hasEnoughTokens(youwareUserId, cost);
    if (!hasEnough) {
      throw new Error('トークン残高が不足しています');
    }

    // 2. Youware APIでトークン消費
    const consumed = await youwareClient.consumeTokens(youwareUserId, cost);
    if (!consumed) {
      throw new Error('トークン消費に失敗しました');
    }

    return true;
  } catch (error) {
    // Youware APIエラーのハンドリング
    console.error('Youware API error:', error);
    throw error;
  }
}
```

**重要**: トークン操作は全てYouware API経由で行い、ローカルDBでの残高管理は行いません。

### 環境変数のセキュリティ
- Gemini API キーはサーバーサイドのみで使用
- **Youware API キーはサーバーサイドのみで使用**
- クライアント側にはYouware API キーを露出しない
- Supabase公開キーは不要（Authを使わないため）
- Stripe関連の環境変数は不要

---

## パフォーマンス最適化

### 並列処理
四面図生成は4枚を並列生成:
```typescript
const imagePromises = views.map(view =>
  generateCharacterSheetView(base64, mimeType, view)
);
const results = await Promise.all(imagePromises);
```

### 画像サイズ制限
- APIルートで10MB制限
- クライアント側で事前圧縮推奨

### エラーハンドリング
- 生成失敗時のトークン返金処理 (現在は未実装、推奨)
- ユーザーフレンドリーなエラーメッセージ

---

## まとめ

### このプロジェクトの核心（Youware版）

1. **Google Gemini API** - AI画像生成エンジン
2. **Supabase MCP** - データベース・ストレージ（画像生成履歴の保存）
3. **Youware API** - ユーザー認証・トークン管理
4. **Youware独自トークンシステム** - 画像生成時に自動消費されるトークン管理

### Youware環境での重要ポイント

✅ **実装すべきこと**
- YowareユーザーIDの取得と検証
- **Supabase MCPの統合**（データベース・ストレージ）
- Youware API統合（トークン残高取得・消費）
- 画像生成前のYouware APIでのトークン残高チェック
- 生成成功後のYouware APIでのトークン消費
- トークン不足時のエラーハンドリング
- **Supabase MCPで生成履歴を記録**
- （推奨）Supabase Storageへの画像保存

❌ **実装不要なもの**
- 独自の会員登録・ログイン機能（マジックリンク認証など）
- Supabase Auth関連の機能
- AuthModal、ログイン画面
- **初回無料トークンの付与機能**（Youware側で管理）
- **ローカルDBでのトークン残高管理**（Youware側で管理）
- **トークン付与・追加機能**（Youware側で管理）
- Stripe決済機能（チェックアウト、Webhook）
- トークン購入機能
- 購入履歴管理
- Stripeライブラリ（`@stripe/stripe-js`, `stripe`）

### 推奨実装手順

Youwareで実装する際は、まず最小機能から始めて、段階的に機能を追加することを推奨します：

1. **フェーズ1（必須）**: Supabase MCP + Youware API統合 + 四面図生成
   - Supabase MCPでデータベースセットアップ
   - Youware APIクライアントの実装
   - トークン残高取得・消費機能
   - 画像生成とトークン消費の統合
   - Supabase MCPで生成履歴を記録
2. **フェーズ2（推奨）**: コンセプトアート生成 + 画像保存
   - Supabase Storageへの画像アップロード
   - `image_history`テーブルへの保存
3. **フェーズ3（オプション）**: 表情差分生成 + プロンプト最適化

---

## 参考情報

### Google Gemini API ドキュメント
- https://ai.google.dev/gemini-api/docs
- Gemini 2.5 Flash Image（画像から画像生成）
- Imagen 4.0（テキストから画像生成）

### Supabase MCP ドキュメント
- https://supabase.com/docs
- **Supabase MCP**を使ったデータベース操作
- PostgreSQL データベース（Supabase Authは使用しない）
- Row Level Security (RLS)
- Database Functions（`get_or_create_user`などの実装）
- Supabase Storage（画像保存）

### Next.js 15 App Router
- https://nextjs.org/docs
- App Router
- API Routes
- Server Components / Client Components

### Youware固有の注意事項
- **ユーザー認証はYouwareが管理** - 独自の会員登録・ログイン機能は不要
- **トークン管理はYouwareプラットフォームが完全管理** - アプリ側でのトークン付与・残高管理は不要
- **Supabase MCPが使える** - データベースとストレージの管理にSupabase MCPを活用
- **外部決済システム（Stripe等）は利用不可**
- **Youware API統合が必須** - トークン残高取得・消費はYouware API経由
- YowareユーザーIDの取得方法はプラットフォーム仕様に従うこと
- **画像生成時にYouware APIでトークンを消費**すること
- **Supabase MCPで生成履歴を記録**すること（推奨）
- 初回無料トークン付与機能は不要（Youware側で管理）
- ローカルDBのトークン残高カラムは不要
