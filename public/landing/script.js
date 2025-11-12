// ========================================
// DOMContentLoaded - 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFAQ();
    initScrollEffects();
    initSmoothScroll();
});

// ========================================
// モバイルメニュー
// ========================================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = document.querySelectorAll('.mobile-menu-link');

    if (!menuBtn || !mobileMenu) return;

    // メニューボタンのクリックイベント
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');

        // メニューが開いているときはスクロールを無効化
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // メニューリンクのクリックでメニューを閉じる
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // メニュー外のクリックでメニューを閉じる
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========================================
// FAQアコーディオン
// ========================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (!question) return;

        question.addEventListener('click', () => {
            // 既に開いているアイテムを閉じるかどうか
            const isActive = item.classList.contains('active');

            // 他の全てのFAQアイテムを閉じる
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // クリックされたアイテムがアクティブでなかった場合は開く
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ========================================
// スクロールエフェクト
// ========================================
function initScrollEffects() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // ヘッダーに影を追加
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // インターセクションオブザーバーで要素が表示されたらアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視
    const animatedElements = document.querySelectorAll(
        '.feature-card, .step, .faq-item'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// スムーススクロール
// ========================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // "#"のみの場合はスキップ
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// ユーティリティ関数
// ========================================

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// スロットル関数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// パフォーマンス最適化
// ========================================

// 画像の遅延読み込み（必要に応じて使用）
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// エラーハンドリング
// ========================================
window.addEventListener('error', (e) => {
    console.error('エラーが発生しました:', e.error);
});

// ========================================
// ページ読み込み完了時の処理
// ========================================
window.addEventListener('load', () => {
    // ローディング完了のアニメーション等
    document.body.classList.add('loaded');
});
