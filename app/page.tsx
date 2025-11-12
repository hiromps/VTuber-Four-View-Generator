import LandingPage from '@/components/LandingPage'

export const metadata = {
    title: 'VTuber四面図ジェネレーター | AIで簡単キャラクター作成',
    description: '立ち絵1枚から四面図を自動生成。VTuberやゲームキャラクターのデザインを簡単に作成できるAIツール',
    keywords: 'VTuber, 四面図, AI, キャラクター生成, 立ち絵, ゲーム開発',
    openGraph: {
        title: 'VTuber四面図ジェネレーター',
        description: '立ち絵1枚から四面図を自動生成',
        type: 'website',
    },
}

export default function HomePage() {
    return <LandingPage />
}
