'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import './landing.css'

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
    const [activeFeature, setActiveFeature] = useState(0)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [scrollY, setScrollY] = useState(0)
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [particlesInitialized, setParticlesInitialized] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.pageYOffset > 50)
            setScrollY(window.pageYOffset)
        }

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            })
        }

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('mousemove', handleMouseMove)
        }
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

    // パーティクルエフェクトの初期化
    useEffect(() => {
        if (!canvasRef.current || particlesInitialized) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles: Array<{
            x: number
            y: number
            vx: number
            vy: number
            size: number
            color: string
        }> = []

        const colors = ['#FF00FF', '#00FFFF', '#FFD700', '#FF69B4', '#9370DB', '#00CED1']

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)]
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach(particle => {
                particle.x += particle.vx
                particle.y += particle.vy

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = particle.color
                ctx.fill()

                // グロー効果
                ctx.shadowBlur = 10
                ctx.shadowColor = particle.color
            })

            requestAnimationFrame(animate)
        }

        animate()
        setParticlesInitialized(true)

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [particlesInitialized])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3)
        }, 3000)
        return () => clearInterval(interval)
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
            {/* パーティクルキャンバス */}
            <canvas ref={canvasRef} className="particle-canvas"></canvas>

            {/* 複数のグラデーション背景 */}
            <div className="gradient-bg-container">
                <div className="gradient-orb gradient-orb-1" style={{
                    transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
                }}></div>
                <div className="gradient-orb gradient-orb-2" style={{
                    transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`
                }}></div>
                <div className="gradient-orb gradient-orb-3" style={{
                    transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`
                }}></div>
                <div className="gradient-mesh"></div>
            </div>

            {/* ホログラフィックオーバーレイ */}
            <div className="holographic-overlay"></div>

            {/* ヘッダー - グラスモーフィズム */}
            <header className={`header futuristic-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="header-content">
                        <div className="logo neon-logo">
                            <div className="logo-cube">
                                <div className="cube-face cube-front"></div>
                                <div className="cube-face cube-back"></div>
                                <div className="cube-face cube-left"></div>
                                <div className="cube-face cube-right"></div>
                                <div className="cube-face cube-top"></div>
                                <div className="cube-face cube-bottom"></div>
                            </div>
                            <span className="logo-text neon-text">四面図AI</span>
                        </div>

                        <nav className="nav cyber-nav">
                            <a href="#features" className="nav-link glitch-link">
                                <span className="link-text" data-text="機能">機能</span>
                            </a>
                            <a href="#how-to-use" className="nav-link glitch-link">
                                <span className="link-text" data-text="使い方">使い方</span>
                            </a>
                            <a href="#showcase" className="nav-link glitch-link">
                                <span className="link-text" data-text="ショーケース">ショーケース</span>
                            </a>
                            <Link href="/app" className="nav-cta holographic-btn">
                                <span className="btn-text">START</span>
                                <div className="btn-glow"></div>
                            </Link>
                        </nav>

                        <button
                            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="メニュー"
                        >
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* モバイルメニュー */}
            <div className={`mobile-menu minimal-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <a href="#features" className="mobile-menu-link" onClick={handleNavClick}>機能</a>
                <a href="#how-to-use" className="mobile-menu-link" onClick={handleNavClick}>使い方</a>
                <a href="#faq" className="mobile-menu-link" onClick={handleNavClick}>FAQ</a>
                <Link href="/app" className="mobile-menu-cta" onClick={handleNavClick}>はじめる</Link>
            </div>

            {/* ヒーローセクション - パララックス＆3D */}
            <section className="hero cyber-hero">
                <div className="parallax-container">
                    <div className="parallax-layer layer-1" style={{
                        transform: `translateY(${scrollY * 0.5}px)`
                    }}>
                        <div className="floating-element element-1"></div>
                    </div>
                    <div className="parallax-layer layer-2" style={{
                        transform: `translateY(${scrollY * 0.3}px)`
                    }}>
                        <div className="floating-element element-2"></div>
                    </div>
                    <div className="parallax-layer layer-3" style={{
                        transform: `translateY(${scrollY * 0.1}px)`
                    }}>
                        <div className="floating-element element-3"></div>
                    </div>
                </div>

                <div className="container hero-container">
                    <div className="hero-content futuristic-content">
                        <div className="hero-text-area">
                            <div className="glowing-badge">
                                <span className="badge-text">NEXT GEN AI</span>
                                <div className="badge-pulse"></div>
                            </div>

                            <h1 className="hero-title cyber-title">
                                <span className="title-line line-1">
                                    <span className="glitch-text" data-text="VTuber">VTuber</span>
                                    <span className="neon-accent">立ち絵</span>
                                </span>
                                <span className="title-line line-2">
                                    <span className="gradient-text">四面図</span>
                                    <span className="holographic-text">自動生成</span>
                                </span>
                            </h1>

                            <div className="hero-description glass-card">
                                <p className="desc-text">
                                    最先端の<span className="highlight-text">AI技術</span>と
                                    <span className="highlight-text">ディープラーニング</span>により
                                    瞬時に高品質な四面図を生成
                                </p>
                            </div>

                            <div className="hero-actions futuristic-actions">
                                <Link href="/app" className="cta-button primary-cta">
                                    <div className="btn-inner">
                                        <span className="btn-text-main">START GENERATION</span>
                                        <span className="btn-text-hover">今すぐ始める</span>
                                    </div>
                                    <div className="btn-effects">
                                        <div className="btn-glow-effect"></div>
                                        <div className="btn-particle-effect"></div>
                                    </div>
                                </Link>
                                <a href="#showcase" className="cta-button secondary-cta">
                                    <span>デモを見る</span>
                                    <div className="btn-border-animation"></div>
                                </a>
                            </div>

                            <div className="hero-stats holographic-stats">
                                <div className="stat-card stat-card-1" style={{
                                    transform: `rotateY(${mousePosition.x * 10}deg) rotateX(${mousePosition.y * -10}deg)`
                                }}>
                                    <div className="stat-icon">⚡</div>
                                    <span className="stat-value">2-5分</span>
                                    <span className="stat-label">超高速生成</span>
                                </div>
                                <div className="stat-card stat-card-2" style={{
                                    transform: `rotateY(${mousePosition.x * 10}deg) rotateX(${mousePosition.y * -10}deg)`
                                }}>
                                    <div className="stat-icon">🎯</div>
                                    <span className="stat-value">99%</span>
                                    <span className="stat-label">高精度AI</span>
                                </div>
                                <div className="stat-card stat-card-3" style={{
                                    transform: `rotateY(${mousePosition.x * 10}deg) rotateX(${mousePosition.y * -10}deg)`
                                }}>
                                    <div className="stat-icon">✨</div>
                                    <span className="stat-value">∞</span>
                                    <span className="stat-label">無制限商用利用</span>
                                </div>
                            </div>
                        </div>

                        {/* 3D ビジュアル展示 */}
                        <div className="hero-visual-area">
                            <div className="three-d-showcase">
                                <div className="showcase-container" style={{
                                    transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${mousePosition.y * -5}deg)`
                                }}>
                                    <div className="hologram-display">
                                        <div className="hologram-content">
                                            <img
                                                src="/hero-vtuber.png"
                                                alt="VTuber四面図"
                                                className="showcase-image"
                                            />
                                            <div className="hologram-scanlines"></div>
                                            <div className="hologram-glitch"></div>
                                        </div>
                                        <div className="hologram-base">
                                            <div className="base-lights"></div>
                                        </div>
                                    </div>

                                    {/* フローティング3Dカード */}
                                    <div className="floating-cards">
                                        <div className="float-card card-1">
                                            <div className="card-content">
                                                <span className="card-label">前面</span>
                                            </div>
                                        </div>
                                        <div className="float-card card-2">
                                            <div className="card-content">
                                                <span className="card-label">側面</span>
                                            </div>
                                        </div>
                                        <div className="float-card card-3">
                                            <div className="card-content">
                                                <span className="card-label">背面</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ネオンリング装飾 */}
                                <div className="neon-rings">
                                    <div className="neon-ring ring-1"></div>
                                    <div className="neon-ring ring-2"></div>
                                    <div className="neon-ring ring-3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 特徴セクション - 3D回転カード */}
            <section className="features cyber-features" id="features">
                <div className="container">
                    <div className="section-header futuristic-header">
                        <div className="header-decoration">
                            <div className="deco-line deco-line-left"></div>
                            <h2 className="section-title glowing-title">
                                <span className="title-main">FEATURES</span>
                                <span className="title-sub">先進的機能</span>
                            </h2>
                            <div className="deco-line deco-line-right"></div>
                        </div>
                        <p className="section-desc holographic-text">
                            次世代AI技術による革新的な四面図生成システム
                        </p>
                    </div>

                    <div className="features-3d-grid">
                        {/* 3D回転カード1 */}
                        <div
                            className="feature-3d-card"
                            onMouseEnter={() => setHoveredCard(0)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className={`card-3d-container ${hoveredCard === 0 ? 'flipped' : ''}`}>
                                <div className="card-3d-front glass-card">
                                    <div className="card-icon-container">
                                        <div className="icon-glow"></div>
                                        <div className="icon-3d">⚡</div>
                                    </div>
                                    <h3 className="card-title neon-text">超高速処理</h3>
                                    <div className="card-divider"></div>
                                    <p className="card-preview">量子並列処理による瞬速生成</p>
                                </div>
                                <div className="card-3d-back glass-card">
                                    <div className="back-content">
                                        <h4 className="back-title">Performance Details</h4>
                                        <ul className="feature-list">
                                            <li>GPU最適化処理</li>
                                            <li>並列バッチ処理対応</li>
                                            <li>リアルタイムプレビュー</li>
                                            <li>最大10倍速処理</li>
                                        </ul>
                                        <div className="performance-meter">
                                            <div className="meter-fill"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3D回転カード2 */}
                        <div
                            className="feature-3d-card"
                            onMouseEnter={() => setHoveredCard(1)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className={`card-3d-container ${hoveredCard === 1 ? 'flipped' : ''}`}>
                                <div className="card-3d-front glass-card">
                                    <div className="card-icon-container">
                                        <div className="icon-glow"></div>
                                        <div className="icon-3d">🎨</div>
                                    </div>
                                    <h3 className="card-title neon-text">高品質出力</h3>
                                    <div className="card-divider"></div>
                                    <p className="card-preview">8K対応超高解像度</p>
                                </div>
                                <div className="card-3d-back glass-card">
                                    <div className="back-content">
                                        <h4 className="back-title">Quality Specs</h4>
                                        <ul className="feature-list">
                                            <li>最大8K解像度対応</li>
                                            <li>無劣化ベクター出力</li>
                                            <li>自動品質最適化</li>
                                            <li>プロ仕様カラー管理</li>
                                        </ul>
                                        <div className="quality-badge">
                                            <span className="badge-text">PRO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3D回転カード3 */}
                        <div
                            className="feature-3d-card"
                            onMouseEnter={() => setHoveredCard(2)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className={`card-3d-container ${hoveredCard === 2 ? 'flipped' : ''}`}>
                                <div className="card-3d-front glass-card">
                                    <div className="card-icon-container">
                                        <div className="icon-glow"></div>
                                        <div className="icon-3d">🤖</div>
                                    </div>
                                    <h3 className="card-title neon-text">AI自動最適化</h3>
                                    <div className="card-divider"></div>
                                    <p className="card-preview">ディープラーニング搭載</p>
                                </div>
                                <div className="card-3d-back glass-card">
                                    <div className="back-content">
                                        <h4 className="back-title">AI Features</h4>
                                        <ul className="feature-list">
                                            <li>自動ポーズ補正</li>
                                            <li>スタイル学習機能</li>
                                            <li>インテリジェント補間</li>
                                            <li>進化型アルゴリズム</li>
                                        </ul>
                                        <div className="ai-indicator">
                                            <div className="indicator-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* フローティング装飾要素 */}
                    <div className="features-decoration">
                        <div className="floating-hexagon hex-1"></div>
                        <div className="floating-hexagon hex-2"></div>
                        <div className="floating-hexagon hex-3"></div>
                    </div>
                </div>
            </section>

            {/* 使い方セクション - タイムラインアニメーション */}
            <section className="how-to-use cyber-how-to" id="how-to-use">
                <div className="container">
                    <div className="section-header futuristic-header">
                        <h2 className="section-title glowing-title">
                            <span className="title-main">HOW IT WORKS</span>
                            <span className="title-sub">使用方法</span>
                        </h2>
                        <p className="section-desc">
                            3つの簡単ステップで驚異的な結果を
                        </p>
                    </div>

                    <div className="timeline-container">
                        <div className="timeline-path">
                            <svg className="timeline-svg" viewBox="0 0 1200 400">
                                <defs>
                                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#FF00FF" />
                                        <stop offset="50%" stopColor="#00FFFF" />
                                        <stop offset="100%" stopColor="#FFD700" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 100 200 Q 400 100 600 200 T 1100 200"
                                    stroke="url(#pathGradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    className="animated-path"
                                />
                            </svg>
                        </div>

                        <div className="timeline-steps">
                            <div className="timeline-step step-1">
                                <div className="step-bubble glass-card">
                                    <div className="bubble-number">01</div>
                                    <div className="bubble-icon">📤</div>
                                </div>
                                <div className="step-info">
                                    <h3 className="step-title neon-text">アップロード</h3>
                                    <p className="step-desc">VTuber画像をドラッグ＆ドロップ</p>
                                    <div className="step-animation">
                                        <div className="upload-icon"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="timeline-step step-2">
                                <div className="step-bubble glass-card">
                                    <div className="bubble-number">02</div>
                                    <div className="bubble-icon">🧠</div>
                                </div>
                                <div className="step-info">
                                    <h3 className="step-title neon-text">AI処理</h3>
                                    <p className="step-desc">ニューラルネットワークが解析</p>
                                    <div className="step-animation">
                                        <div className="ai-processing">
                                            <div className="process-ring"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="timeline-step step-3">
                                <div className="step-bubble glass-card">
                                    <div className="bubble-number">03</div>
                                    <div className="bubble-icon">✨</div>
                                </div>
                                <div className="step-info">
                                    <h3 className="step-title neon-text">完成</h3>
                                    <p className="step-desc">四面図をダウンロード</p>
                                    <div className="step-animation">
                                        <div className="download-icon"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* フローティングパーティクル */}
                        <div className="timeline-particles">
                            <div className="particle p1"></div>
                            <div className="particle p2"></div>
                            <div className="particle p3"></div>
                            <div className="particle p4"></div>
                            <div className="particle p5"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ショーケースセクション - 新規追加 */}
            <section className="showcase-section" id="showcase">
                <div className="container">
                    <div className="section-header futuristic-header">
                        <h2 className="section-title glowing-title">
                            <span className="title-main">SHOWCASE</span>
                            <span className="title-sub">生成例</span>
                        </h2>
                    </div>

                    <div className="showcase-carousel">
                        <div className="carousel-track">
                            <div className="showcase-item">
                                <div className="showcase-card holographic-card">
                                    <div className="card-image">
                                        <img src="/hero-vtuber.png" alt="Sample 1" />
                                        <div className="image-overlay"></div>
                                    </div>
                                    <div className="card-info">
                                        <span className="card-tag">Sample #001</span>
                                    </div>
                                </div>
                            </div>
                            <div className="showcase-item">
                                <div className="showcase-card holographic-card">
                                    <div className="card-image">
                                        <img src="/hero-vtuber.png" alt="Sample 2" />
                                        <div className="image-overlay"></div>
                                    </div>
                                    <div className="card-info">
                                        <span className="card-tag">Sample #002</span>
                                    </div>
                                </div>
                            </div>
                            <div className="showcase-item">
                                <div className="showcase-card holographic-card">
                                    <div className="card-image">
                                        <img src="/hero-vtuber.png" alt="Sample 3" />
                                        <div className="image-overlay"></div>
                                    </div>
                                    <div className="card-info">
                                        <span className="card-tag">Sample #003</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQセクション */}
            <section className="faq minimal-faq" id="faq">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-ja">よくある質問</span>
                            <span className="title-en">FAQ</span>
                        </h2>
                    </div>

                    <div className="faq-list">
                        {faqData.map((item, index) => (
                            <div key={index} className={`faq-item ${activeFAQ === index ? 'active' : ''}`}>
                                <button className="faq-question" onClick={() => toggleFAQ(index)}>
                                    <span>{item.question}</span>
                                    <div className="faq-icon">
                                        <span className="icon-plus"></span>
                                    </div>
                                </button>
                                <div className="faq-answer">
                                    <div className="answer-content">
                                        <p>{item.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTAセクション */}
            <section className="cta minimal-cta">
                <div className="container">
                    <div className="cta-content">
                        <div className="cta-gradient"></div>
                        <h2 className="cta-title">今すぐ始めましょう</h2>
                        <p className="cta-description">
                            無料で四面図生成を体験できます
                        </p>
                        <Link href="/app" className="cta-button">
                            <span>無料で始める</span>
                            <div className="btn-shine"></div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* フッター */}
            <footer className="footer minimal-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="logo minimal-logo">
                                <div className="logo-mark">
                                    <div className="logo-shape"></div>
                                </div>
                                <span className="logo-text">四面図</span>
                            </div>
                            <p className="footer-tagline">AI技術で創造を支援</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4 className="footer-title">サービス</h4>
                                <Link href="/app">アプリケーション</Link>
                                <a href="#features">機能</a>
                                <a href="#how-to-use">使い方</a>
                            </div>
                            <div className="footer-column">
                                <h4 className="footer-title">サポート</h4>
                                <a href="#faq">FAQ</a>
                                <Link href="/contact">お問い合わせ</Link>
                                <Link href="/privacy">プライバシーポリシー</Link>
                                <Link href="/terms">利用規約</Link>
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