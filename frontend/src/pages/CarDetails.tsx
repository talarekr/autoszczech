import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../lib/api'
import { useTranslation } from 'react-i18next'

export default function CarDetails(){
  const { id } = useParams()
  const [car, setCar] = useState<any>(null)
  const { t } = useTranslation()

  useEffect(()=>{ axios.get(`${API_URL}/api/cars/${id}`).then(r=>setCar(r.data)) },[id])
  if(!car) return <div className="text-neutral-400">Ładowanie…</div>

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-yellow-400">← Powrót</Link>
      <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-3">
            <img src={car.images?.[0]?.url} className="w-full h-80 object-cover rounded" />
            <div className="grid grid-cols-3 gap-3">
              {car.images?.slice(1).map((im:any)=> (
                <img key={im.id||im.url} src={im.url} className="w-full h-24 object-cover rounded" />
              ))}
            </div>
          </div>
          <div className="col-span-1 space-y-2">
            <h1 className="text-2xl font-bold">{car.make} {car.model}</h1>
            <div className="text-neutral-400 text-sm">{t('year')}: {car.year} · {t('mileage')}: {car.mileage.toLocaleString()} km</div>
            <div className="text-yellow-400 text-xl font-bold">{t('price')}: {car.price} zł</div>
            {car.auctionEnd && (
              <div className="text-sm text-neutral-300">Koniec aukcji: {new Date(car.auctionEnd).toLocaleString()}</div>
            )}
            <p className="text-neutral-300 pt-2 whitespace-pre-line">{car.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
