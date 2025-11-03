# Supabase メールテンプレート設定ガイド

このガイドでは、Supabaseのメール確認テンプレートを充実させる方法を説明します。

## 📋 目次

1. [テンプレートの概要](#テンプレートの概要)
2. [Supabaseでの設定手順](#supabaseでの設定手順)
3. [カスタマイズオプション](#カスタマイズオプション)
4. [テスト方法](#テスト方法)

---

## テンプレートの概要

### 🎨 デザインの特徴

- **レスポンシブデザイン**: モバイルとデスクトップで最適に表示
- **ブランドカラー**: グラデーション（#667eea → #764ba2）
- **プロフェッショナル**: クリーンで現代的なレイアウト
- **多言語対応**: 英語版と日本語版を用意

### 📂 ファイル構成

```
supabase/email-templates/
├── confirm-signup.html       # サインアップ確認（英語）
├── confirm-signup-ja.html    # サインアップ確認（日本語）
├── magic-link.html           # マジックリンク（英語）
├── magic-link-ja.html        # マジックリンク（日本語）
├── reset-password.html       # パスワードリセット（英語）
├── reset-password-ja.html    # パスワードリセット（日本語）
└── EMAIL_TEMPLATE_SETUP.md   # このドキュメント
```

---

## Supabaseでの設定手順

### ステップ1: Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択

### ステップ2: 認証設定に移動

1. 左サイドバーから **Authentication** をクリック
2. **Email Templates** タブを選択

### ステップ3: テンプレートを編集

#### サインアップ確認メール
1. **Confirm signup** テンプレートを選択
2. 既存のHTMLを削除
3. `confirm-signup.html` または `confirm-signup-ja.html` の内容をコピー＆ペースト
4. **Save** をクリック

#### Magic Link（パスワードレスログイン）
1. **Magic Link** テンプレートを選択
2. 既存のHTMLを削除
3. `magic-link.html` または `magic-link-ja.html` の内容をコピー＆ペースト
4. **Save** をクリック

#### パスワードリセット
1. **Reset Password** テンプレートを選択
2. 既存のHTMLを削除
3. `reset-password.html` または `reset-password-ja.html` の内容をコピー＆ペースト
4. **Save** をクリック

### ステップ4: 変数の確認

以下の変数がSupabaseから自動的に提供されます：

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{ .ConfirmationURL }}` | 確認リンクURL | https://your-project.supabase.co/auth/v1/verify... |
| `{{ .Email }}` | ユーザーのメールアドレス | user@example.com |
| `{{ .Token }}` | 確認トークン（オプション） | abc123... |
| `{{ .SiteURL }}` | サイトURL | https://your-app.com |

### ステップ5: 保存とテスト

1. **Save** ボタンをクリック
2. テストメールを送信して確認

---

## カスタマイズオプション

### 🎨 ブランドカラーの変更

グラデーションを変更する場合：

```html
<!-- 現在のグラデーション -->
<td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">

<!-- 例：青からシアンへ -->
<td style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);">
```

### 📧 サポートメールアドレスの変更

```html
<!-- 現在 -->
<a href="mailto:support@example.com">support@example.com</a>

<!-- 実際のメールアドレスに変更 -->
<a href="mailto:your-support@yourdomain.com">your-support@yourdomain.com</a>
```

### 🌐 サイトURLの追加

フッターにサイトへのリンクを追加：

```html
<p style="margin: 10px 0 0 0;">
    <a href="https://your-app.com" style="color: #667eea; text-decoration: none;">
        Visit Our Website
    </a>
</p>
```

### 🖼️ ロゴの追加

ヘッダーにロゴ画像を追加する場合：

```html
<tr>
    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
        <!-- ロゴを追加 -->
        <img src="https://your-domain.com/logo.png"
             alt="VTuber Four View Generator"
             style="max-width: 200px; height: auto; margin-bottom: 20px;">

        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
            VTuber Four View Generator
        </h1>
    </td>
</tr>
```

---

## テスト方法

### 方法1: Supabaseのテスト送信機能

1. Email Templates画面で **Send test email** をクリック
2. テスト用メールアドレスを入力
3. 受信したメールを確認

### 方法2: 実際のサインアップ

1. アプリで新しいアカウントを作成
2. 確認メールを受信
3. デザインと機能を確認

### チェックリスト

- [ ] メールが正しく表示される（デスクトップ）
- [ ] メールが正しく表示される（モバイル）
- [ ] 確認ボタンが機能する
- [ ] リンクが正しく動作する
- [ ] すべてのテキストが読みやすい
- [ ] ブランドカラーが正しい
- [ ] 画像（ある場合）が表示される

---

## トラブルシューティング

### 問題: メールが届かない

**解決策:**
1. Supabaseのメール送信設定を確認
2. スパムフォルダを確認
3. メールプロバイダーの制限を確認

### 問題: レイアウトが崩れる

**解決策:**
1. インラインCSSを使用していることを確認
2. テーブルレイアウトを使用（divは避ける）
3. メールクライアントの互換性を確認

### 問題: グラデーションが表示されない

**解決策:**
一部のメールクライアントはグラデーションをサポートしていません。フォールバックカラーを追加：

```html
<td style="background-color: #667eea; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
```

---

## その他のテンプレート

### ✅ 用意されているテンプレート

以下のテンプレートはすぐに使用できます：

1. **✨ Confirm Signup** - サインアップ確認
   - ファイル: `confirm-signup.html` / `confirm-signup-ja.html`
   - 用途: 新規ユーザーのメールアドレス確認

2. **🔗 Magic Link** - パスワードレスログイン
   - ファイル: `magic-link.html` / `magic-link-ja.html`
   - 用途: パスワード不要の簡単ログイン

3. **🔒 Reset Password** - パスワードリセット
   - ファイル: `reset-password.html` / `reset-password-ja.html`
   - 用途: パスワードを忘れた場合のリセット

### 📝 追加でカスタマイズ可能なテンプレート

Supabaseでは以下のテンプレートもカスタマイズできます：

1. **Change Email Address** - メールアドレス変更確認
2. **Invite User** - ユーザー招待

これらも同様の手順でカスタマイズ可能です。

---

## リソース

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [HTML Email Best Practices](https://www.campaignmonitor.com/css/)
- [Email Client CSS Support](https://www.caniemail.com/)

---

## サポート

質問や問題がある場合は、プロジェクトのIssuesセクションで報告してください。

Made with ❤️ for VTuber creators
