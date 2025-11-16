'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import './landing.css'

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeFAQ, setActiveFAQ] = useState<number | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.pageYOffset > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileMenuOpen])

    // ヘッダーの高さを取得してCSSカスタムプロパティに設定
    useEffect(() => {
        const updateHeaderHeight = () => {
            const header = document.querySelector('.header') as HTMLElement
            if (header) {
                const headerHeight = header.offsetHeight
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
            }
        }

        updateHeaderHeight()
        window.addEventListener('resize', updateHeaderHeight)

        return () => window.removeEventListener('resize', updateHeaderHeight)
    }, [])

    const toggleFAQ = (index: number) => {
        setActiveFAQ(activeFAQ === index ? null : index)
    }

    const handleNavClick = () => {
        setMobileMenuOpen(false)
    }

    const faqData = [
        {
            question: '利用料金はかかりますか？',
            answer: '基本機能は無料でご利用いただけます。トークン制となっており、初回登録時に無料トークンをプレゼント。追加トークンは必要に応じて購入できます。'
        },
        {
            question: 'どのような画像形式に対応していますか？',
            answer: 'JPG、PNG、WebP形式の画像に対応しています。最大ファイルサイズは10MBまでです。'
        },
        {
            question: '生成された画像の商用利用は可能ですか？',
            answer: 'はい、生成された画像は商用利用が可能です。ただし、元の立ち絵の著作権については、アップロード者が適切な権利を持っていることを確認してください。'
        },
        {
            question: '生成にはどのくらい時間がかかりますか？',
            answer: '通常、1つの四面図セットの生成には2〜5分程度かかります。サーバーの混雑状況により多少前後する場合があります。'
        },
        {
            question: 'アカウント登録は必須ですか？',
            answer: 'アカウント登録なしでもお試しいただけます。ただし、生成履歴の保存やトークンの管理には登録が必要です。'
        }
    ]

    return (
        <>
            {/* ヘッダー */}
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <span className="logo-icon">✨</span>
                            <span className="logo-text">VTuber四面図</span>
                        </div>
                        <nav className="nav">
                            <a href="#features" className="nav-link">特徴</a>
                            <a href="#how-to-use" className="nav-link">使い方</a>
                            <a href="#faq" className="nav-link">FAQ</a>
                            <Link href="/live2d-parts" className="nav-link">Live2Dパーツ分け</Link>
                            <Link href="/app" className="btn btn-primary btn-small">アプリを開く</Link>
                        </nav>
                        <button
                            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="メニュー"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* モバイルメニュー */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <a href="#features" className="mobile-menu-link" onClick={handleNavClick}>特徴</a>
                <a href="#how-to-use" className="mobile-menu-link" onClick={handleNavClick}>使い方</a>
                <a href="#faq" className="mobile-menu-link" onClick={handleNavClick}>FAQ</a>
                <Link href="/live2d-parts" className="mobile-menu-link" onClick={handleNavClick}>Live2Dパーツ分け</Link>
                <Link href="/app" className="btn btn-primary" onClick={handleNavClick}>アプリを開く</Link>
            </div>

            {/* ヒーローセクション */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                <span className="hero-title-main">立ち絵1枚から</span>
                                <span className="hero-title-sub">四面図を自動生成</span>
                            </h1>
                            <p className="hero-description">
                                VTuberやゲームキャラクターのデザインに必要な四面図を、AIが自動で作成。<br/>
                                手間のかかる作業を数分で完了できます。
                            </p>
                            <div className="hero-buttons">
                                <Link href="/app" className="btn btn-primary btn-large">
                                    <span>無料で始める</span>
                                    <svg className="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Link>
                                <a href="#how-to-use" className="btn btn-secondary btn-large">使い方を見る</a>
                            </div>
                            <div className="hero-note">
                                <svg className="note-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 11C7.59 11 7.25 10.66 7.25 10.25V7.75C7.25 7.34 7.59 7 8 7C8.41 7 8.75 7.34 8.75 7.75V10.25C8.75 10.66 8.41 11 8 11ZM8.75 5.75C8.75 6.16 8.41 6.5 8 6.5C7.59 6.5 7.25 6.16 7.25 5.75C7.25 5.34 7.59 5 8 5C8.41 5 8.75 5.34 8.75 5.75Z" fill="currentColor"/>
                                </svg>
                                <span>アカウント登録不要で今すぐお試しいただけます</span>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="hero-card">
                                <div className="card-glow"></div>
                                <div className="card-content">
                                    <div className="grid-preview">
                                        <div className="grid-item">正面</div>
                                        <div className="grid-item">背面</div>
                                        <div className="grid-item">左側面</div>
                                        <div className="grid-item">右側面</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 特徴セクション */}
            <section className="features" id="features">
                <div className="container">
                    <h2 className="section-title">
                        <span className="section-title-icon">⭐</span>
                        主な特徴
                    </h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M24 14V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h3 className="feature-title">たった数分で完成</h3>
                            <p className="feature-description">
                                立ち絵をアップロードするだけで、AIが自動的に4方向からの画像を生成。従来数時間かかっていた作業が数分で完了します。
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M8 20H40" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="14" cy="16" r="1.5" fill="currentColor"/>
                                    <circle cx="19" cy="16" r="1.5" fill="currentColor"/>
                                </svg>
                            </div>
                            <h3 className="feature-title">高品質な出力</h3>
                            <p className="feature-description">
                                最新のAI技術により、元のキャラクターデザインを忠実に再現。細部までこだわった高品質な四面図を生成します。
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <path d="M24 8L28 16H36L30 22L32 30L24 26L16 30L18 22L12 16H20L24 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="feature-title">簡単カスタマイズ</h3>
                            <p className="feature-description">
                                表情差分やポーズの指定も可能。あなたの理想のキャラクターデザインを自由に実現できます。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 使い方セクション */}
            <section className="how-to-use" id="how-to-use">
                <div className="container">
                    <h2 className="section-title">
                        <span className="section-title-icon">📝</span>
                        使い方
                    </h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3 className="step-title">立ち絵をアップロード</h3>
                                <p className="step-description">
                                    お持ちのキャラクター立ち絵をアップロードします。JPG、PNG形式に対応しています。
                                </p>
                            </div>
                            <div className="step-visual">
                                <div className="upload-preview">
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                        <rect x="8" y="16" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                                        <path d="M32 28V44M32 28L26 34M32 28L38 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3 className="step-title">生成ボタンをクリック</h3>
                                <p className="step-description">
                                    必要に応じて追加の指示を入力し、生成ボタンをクリックするだけ。AIが自動で処理を開始します。
                                </p>
                            </div>
                            <div className="step-visual">
                                <div className="generate-preview">
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3 className="step-title">ダウンロード</h3>
                                <p className="step-description">
                                    生成された四面図をダウンロード。すぐにVTuberモデルやゲーム制作に活用できます。
                                </p>
                            </div>
                            <div className="step-visual">
                                <div className="download-preview">
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                        <path d="M32 16V40M32 40L24 32M32 40L40 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M16 44V48C16 50.2091 17.7909 52 20 52H44C46.2091 52 48 50.2091 48 48V44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQセクション */}
            <section className="faq" id="faq">
                <div className="container">
                    <h2 className="section-title">
                        <span className="section-title-icon">❓</span>
                        よくある質問
                    </h2>
                    <div className="faq-list">
                        {faqData.map((item, index) => (
                            <div key={index} className={`faq-item ${activeFAQ === index ? 'active' : ''}`}>
                                <button className="faq-question" onClick={() => toggleFAQ(index)}>
                                    <span>{item.question}</span>
                                    <svg className="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <div className="faq-answer">
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTAセクション */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">さあ、始めましょう</h2>
                        <p className="cta-description">あなたのキャラクターデザインを次のレベルへ</p>
                        <Link href="/app" className="btn btn-primary btn-large">
                            <span>無料で始める</span>
                            <svg className="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* フッター */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="logo">
                                <span className="logo-icon">✨</span>
                                <span className="logo-text">VTuber四面図</span>
                            </div>
                            <p className="footer-description">AIで簡単キャラクター作成</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4 className="footer-column-title">サービス</h4>
                                <Link href="/app" className="footer-link">アプリを開く</Link>
                                <a href="#features" className="footer-link">特徴</a>
                                <a href="#how-to-use" className="footer-link">使い方</a>
                            </div>
                            <div className="footer-column">
                                <h4 className="footer-column-title">サポート</h4>
                                <a href="#faq" className="footer-link">FAQ</a>
                                <Link href="/privacy" className="footer-link">プライバシーポリシー</Link>
                                <Link href="/terms" className="footer-link">利用規約</Link>
                            </div>
                            <div className="footer-column">
                                <h4 className="footer-column-title">フォロー</h4>
                                <div className="social-links">
                                    <a href="#" className="social-link" aria-label="Twitter">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </a>
                                    <a href="#" className="social-link" aria-label="Discord">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 VTuber四面図ジェネレーター. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}
