# Google AdSense 所有権確認トラブルシューティング

## 問題: 「サイトの所有権を確認できませんでした」

### 原因と解決策

#### 1. 環境変数が設定されていない
**確認方法:**
```bash
# ローカル環境
echo $NEXT_PUBLIC_ADSENSE_CLIENT_ID

# Vercel CLI (インストール済みの場合)
vercel env ls
```

**解決策:**
- Vercelダッシュボード → Settings → Environment Variables
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6090439809602995` を追加
- すべての環境（Production, Preview, Development）に設定
- 再デプロイ

#### 2. 最新コミットがデプロイされていない
**確認方法:**
```bash
# GitHub最新コミットを確認
git log --oneline -1

# Vercel デプロイ履歴を確認
# https://vercel.com/[your-team]/[your-project]/deployments
```

**解決策:**
```bash
git push origin main
# またはVercelダッシュボードから手動でRedeploy
```

#### 3. AdSenseスクリプトが読み込まれていない
**確認方法:**
1. 本番サイトを開く: https://vtuber-ai-generator.com
2. F12で開発者ツールを開く
3. Elements/要素タブで `<head>` 内を確認
4. 以下のスクリプトが存在するか確認:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6090439809602995" crossorigin="anonymous"></script>
```

**解決策:**
- スクリプトが見つからない場合、環境変数が正しく設定されていない可能性
- `NEXT_PUBLIC_` プレフィックスが必須（クライアントサイドで使用可能にするため）
- 再デプロイ後にキャッシュをクリア（Ctrl+Shift+R）

#### 4. ビルドエラー
**確認方法:**
```bash
# ローカルでビルドテスト
npm run build

# Vercelデプロイログを確認
# Vercel Dashboard → Deployments → [最新デプロイ] → Build Logs
```

**解決策:**
- エラーがある場合、ビルドログを確認して修正
- 特に`GoogleAnalytics`コンポーネントの`useSearchParams()`エラーに注意
- 最新コミット (a016a2b) で修正済み

#### 5. DNS/ドメイン設定の問題
**確認方法:**
```bash
# ドメインが正しく設定されているか確認
nslookup vtuber-ai-generator.com

# サイトが実際にアクセス可能か確認
curl -I https://vtuber-ai-generator.com
```

**解決策:**
- Vercel Dashboard → Settings → Domains
- ドメインが正しく設定されているか確認
- SSL証明書が有効か確認

#### 6. AdSenseクローラのブロック
**確認方法:**
`public/robots.txt` を確認:
```txt
User-agent: *
Allow: /
```

**解決策:**
- robots.txtでAdSenseクローラがブロックされていないか確認
- 現在の設定は問題なし（すべて許可）

#### 7. 待機時間が必要
**原因:**
Google AdSenseのクローラがサイトをクロールするまで時間がかかる場合があります。

**解決策:**
- コードが正しく実装されている場合、**24-48時間**待つ
- その間に他の確認項目を再チェック

## 推奨チェックリスト

- [ ] Vercel環境変数が設定されている
  - `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6090439809602995`
  - `NEXT_PUBLIC_SITE_URL=https://vtuber-ai-generator.com`
- [ ] 最新コミット (a016a2b 以降) がmainブランチにマージ済み
- [ ] 本番環境にデプロイ済み
- [ ] 本番サイトでAdSenseスクリプトタグが表示される
- [ ] ビルドエラーがない
- [ ] ドメインが正しく設定されている
- [ ] robots.txtでクローラを許可している
- [ ] 24-48時間待機（必要に応じて）

## 検証スクリプト

本番サイトでAdSenseが正しく読み込まれているか確認:

```javascript
// ブラウザのコンソールで実行
// 1. スクリプトタグの確認
document.querySelector('script[src*="pagead2.googlesyndication.com"]')?.src

// 2. Client IDの確認
document.querySelector('script[src*="pagead2.googlesyndication.com"]')?.src.match(/client=(ca-pub-\d+)/)?.[1]

// 3. adsbygoogle配列の確認
window.adsbygoogle
```

期待される出力:
```
1. "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6090439809602995"
2. "ca-pub-6090439809602995"
3. Array (または空配列 [])
```

## Google AdSenseサポート

上記すべてを試しても解決しない場合:
1. Google AdSenseヘルプセンター: https://support.google.com/adsense
2. AdSenseコミュニティフォーラム: https://support.google.com/adsense/community
3. 具体的なエラーメッセージをコピーして検索

## 関連コミット

- `b0aef02`: Google AdSenseスクリプト設置とSEO最適化機能を追加
- `a016a2b`: GoogleAnalyticsのuseSearchParams()をSuspenseでラップしてビルドエラーを修正

## 関連ファイル

- `app/layout.tsx:95-96` - AdSenseスクリプトの読み込み
- `components/GoogleAdSense.tsx` - AdSenseコンポーネント実装
- `.env.local` - ローカル環境変数（本番は未設定の可能性）
- `public/robots.txt` - クローラ設定
