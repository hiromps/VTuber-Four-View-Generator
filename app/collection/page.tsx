import { CollectionView } from '@/components/collection'

export const metadata = {
  title: 'マイコレクション | VTuber四面図ジェネレーター',
  description: 'あなたが生成したキャラクター画像のコレクションを閲覧・管理できます。',
  openGraph: {
    title: 'マイコレクション | VTuber四面図ジェネレーター',
    description: 'あなたが生成したキャラクター画像のコレクションを閲覧・管理できます。',
  },
}

export default function CollectionPage() {
  return <CollectionView />
}
