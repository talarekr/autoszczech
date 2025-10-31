import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function CarCard({ car }: any){
  const { t } = useTranslation()
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 grid grid-cols-4 gap-4">
      <div className="col-span-1">
        <img src={car.images?.[0]?.url} className="w-full h-28 object-cover rounded" />
      </div>
      <div className="col-span-2">
        <div className="text-lg font-semibold">{car.make} {car.model}</div>
        <div className="text-sm text-neutral-400">{t('year')}: {car.year} · {t('mileage')}: {car.mileage.toLocaleString()} km</div>
      </div>
      <div className="col-span-1 text-right">
        <div className="text-xl font-bold text-yellow-400">{t('price')}: {car.price} zł</div>
        <Link to={`/offer/${car.id}`} className="mt-3 inline-block px-3 py-1 rounded bg-yellow-400 text-black">{t('details')}</Link>
      </div>
    </div>
  )
}
