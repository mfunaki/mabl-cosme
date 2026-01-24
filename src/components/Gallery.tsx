import { useTranslation } from '../contexts/LanguageContext'

export interface GalleryItem {
  id: string
  dataUrl: string
  createdAt: string
}

interface GalleryProps {
  items: GalleryItem[]
}

export function Gallery({ items }: GalleryProps) {
  const { t } = useTranslation()

  return (
    <section className="bg-white rounded-2xl shadow p-4 md:p-6">
      <h2 className="text-lg font-medium mb-3">{t.gallery}</h2>
      {items.length === 0 ? (
        <p className="text-sm opacity-60">—</p>
      ) : (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((g) => (
            <li key={g.id} className="rounded-2xl border overflow-hidden">
              <img src={g.dataUrl} alt={g.id} className="w-full h-48 object-cover" />
              <div className="p-3 text-xs opacity-70">
                <div>
                  ID: <span data-testid={`gallery-id-${g.id}`}>{g.id}</span>
                </div>
                <div>{new Date(g.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
