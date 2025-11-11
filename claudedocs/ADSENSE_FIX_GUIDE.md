# AdSense審査エラー修正ガイド

## 🔴 発見された問題と修正内容

### 問題1: robots.txtに古いドメインが残っている

**エラー**: 「サイトの停止または利用不可」

**原因**:
- `public/robots.txt`に古いドメイン`https://vtuber-ai-generator.com`がハードコードされていた
- Googleボットが正しいサイトマップを見つけられない
- AdSenseに申請したURL（`https://smartgram.online`）とrobots.txtのドメインが一致しない

**修正内容**:
```diff
# Host
- Host: https://vtuber-ai-generator.com
+ Host: https://smartgram.online

# Sitemaps
- Sitemap: https://vtuber-ai-generator.com/sitemap.xml
+ Sitemap: https://smartgram.online/sitemap.xml
- Sitemap: https://vtuber-ai-generator.com/server-sitemap.xml
+ Sitemap: https://smartgram.online/server-sitemap.xml
```

### 問題2: URLの末尾スラッシュの不一致

**原因**:
- `.env.local`と`.env.example`で`https://smartgram.online/`（スラッシュ付き）
- `next-sitemap.config.js`では`https://smartgram.online`（スラッシュなし）
- URL正規化の問題が発生する可能性

**修正内容**:
```diff
# .env.local と .env.example
- NEXT_PUBLIC_SITE_URL=https://smartgram.online/
+ NEXT_PUBLIC_SITE_URL=https://smartgram.online
```

## ✅ AdSense審査前チェックリスト

### 1. ドメイン設定の確認

- [x] `public/robots.txt` - 新しいドメインに更新済み
- [x] `.env.local` - `NEXT_PUBLIC_SITE_URL=https://smartgram.online`
- [x] `.env.example` - `NEXT_PUBLIC_SITE_URL=https://smartgram.online`
- [x] `next-sitemap.config.js` - `https://smartgram.online`で設定済み
- [ ] **Vercel環境変数** - `NEXT_PUBLIC_SITE_URL=https://smartgram.online`を設定

### 2. Vercel設定の確認

#### ドメイン設定
1. [Vercelダッシュボード](https://vercel.com/dashboard) → プロジェクト → Settings → Domains
2. `smartgram.online`が正しく設定されているか確認
3. DNSレコードが正しく設定されているか確認（Aレコードまたは CNAMEレコード）

#### 環境変数
1. Vercel → Settings → Environment Variables
2. 以下を確認/更新:
   ```
   NEXT_PUBLIC_SITE_URL=https://smartgram.online
   NEXT_PUBLIC_APP_URL=https://smartgram.online
   ```

### 3. サイトのアクセス確認

以下のURLが正常にアクセスできることを確認:

- [ ] `https://smartgram.online` - トップページ
- [ ] `https://smartgram.online/robots.txt` - robots.txtが表示される
- [ ] `https://smartgram.online/sitemap.xml` - サイトマップが表示される
- [ ] HTTPSが有効（南京錠マーク）

### 4. コンテンツの確認

AdSenseは以下を要求します:

- [ ] **十分なコンテンツ** - ページに意味のあるコンテンツが存在する
- [ ] **公開アクセス可能** - ログインなしでコンテンツを閲覧できる
- [ ] **ナビゲーション** - サイト内のページ間を移動できる
- [ ] **プライバシーポリシー** - プライバシーポリシーページがある
- [ ] **お問い合わせ** - お問い合わせ方法が明記されている

### 5. 技術的な確認

```bash
# robots.txtを確認
curl https://smartgram.online/robots.txt

# サイトマップを確認
curl https://smartgram.online/sitemap.xml

# HTTPステータスを確認
curl -I https://smartgram.online
```

期待される出力:
```
HTTP/2 200
content-type: text/html; charset=utf-8
```

### 6. Google Search Consoleでの確認

1. [Google Search Console](https://search.google.com/search-console)にアクセス
2. `smartgram.online`を追加（まだの場合）
3. URL検査ツールで`https://smartgram.online`を検査
4. インデックス登録をリクエスト

## 🚀 デプロイ手順

### 1. 変更をコミット

```bash
git add .
git commit -m "fix: AdSense審査対応 - ドメイン設定を修正"
git push
```

### 2. Vercelで自動デプロイ

Vercelが自動的にデプロイを開始します。

### 3. デプロイ完了後の確認

1. Vercel Dashboardでデプロイが成功したか確認
2. `https://smartgram.online`にアクセス
3. `https://smartgram.online/robots.txt`を確認
   - `Host: https://smartgram.online`が表示されるか確認
   - `Sitemap: https://smartgram.online/sitemap.xml`が表示されるか確認

### 4. サイトマップの再生成（必要な場合）

もしサイトマップが古いドメインのままの場合:

```bash
# ローカルでサイトマップを再生成
npm run build
# または
npx next-sitemap

# 変更をコミット＆プッシュ
git add public/sitemap.xml public/sitemap-0.xml
git commit -m "fix: サイトマップを再生成"
git push
```

## 📝 AdSense再申請の手順

### 1. 24時間待機

ドメイン変更やrobots.txt更新後は、Googleがクロールするまで**24〜48時間**待つことを推奨します。

### 2. Googleボットのクロールを確認

Google Search Consoleで以下を確認:
1. カバレッジレポート
2. サイトマップのステータス
3. インデックス登録の状態

### 3. AdSense再申請

1. [Google AdSense](https://www.google.com/adsense/)にログイン
2. サイト → サイトを管理
3. `https://smartgram.online`の審査を再申請
4. **重要**: URLは`https://smartgram.online`（末尾スラッシュなし）で申請

### 4. 審査中の注意点

- サイトを大きく変更しない
- コンテンツを追加・削除しない
- robots.txtを変更しない
- ドメイン設定を変更しない

## ⚠️ 追加で確認すべき項目

### AdSenseポリシー違反の可能性

以下の項目も確認してください:

#### 1. コンテンツポリシー
- [ ] 違法コンテンツがない
- [ ] 成人向けコンテンツがない
- [ ] 著作権侵害がない
- [ ] 暴力的・差別的コンテンツがない

#### 2. サイト構造
- [ ] 404ページが適切に設定されている
- [ ] ナビゲーションメニューが機能している
- [ ] フッターにリンクがある（プライバシーポリシーなど）

#### 3. ユーザーエクスペリエンス
- [ ] ページの読み込み速度が適切
- [ ] モバイルフレンドリー
- [ ] 広告の配置が適切（コンテンツを隠さない）

## 🔍 トラブルシューティング

### Q1: robots.txtを更新したのにGoogleが古いバージョンを見ている

**A**: Googleのキャッシュをクリア
1. Google Search Console → URL検査
2. `https://smartgram.online/robots.txt`を検査
3. 「インデックス登録をリクエスト」

### Q2: サイトマップが404エラー

**A**: サイトマップを再生成
```bash
npm run build
# または
npx next-sitemap --config next-sitemap.config.js
```

### Q3: 「サイトにアクセスできません」エラーが続く

**A**: 以下を確認
1. DNS設定が正しいか（nslookupまたはdigコマンド）
2. Vercelのドメイン設定が正しいか
3. SSLエラーがないか
4. Firewallでブロックされていないか

```bash
# DNS確認
nslookup smartgram.online

# HTTPS接続確認
curl -I https://smartgram.online
```

### Q4: AdSenseが「コンテンツが不足している」と表示

**A**: 以下を追加
1. ブログ記事（最低10記事、各500文字以上）
2. FAQ ページ
3. 利用規約ページ
4. プライバシーポリシーページ
5. お問い合わせページ

## 📚 参考リンク

- [Google AdSense ポリシー](https://support.google.com/adsense/answer/48182)
- [Google Search Console](https://search.google.com/search-console)
- [Vercel ドメイン設定](https://vercel.com/docs/concepts/projects/domains)
- [Next.js Sitemap](https://github.com/iamvishnusankar/next-sitemap)

## ✅ 最終チェックリスト（デプロイ前）

- [x] robots.txtを新しいドメインに更新
- [x] .env.localのURL末尾スラッシュを削除
- [x] .env.exampleのURL末尾スラッシュを削除
- [ ] Vercelの環境変数を更新
- [ ] Gitにコミット＆プッシュ
- [ ] Vercelデプロイ完了を確認
- [ ] `https://smartgram.online/robots.txt`を確認
- [ ] `https://smartgram.online/sitemap.xml`を確認
- [ ] Google Search Consoleでサイトマップを送信
- [ ] 24〜48時間待機
- [ ] AdSense再申請

---

**最後に**: AdSenseの審査は通常**1〜2週間**かかります。気長に待ちましょう！
