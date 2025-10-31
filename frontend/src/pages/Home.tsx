import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../lib/api'
import CarCard from '../components/CarCard'

export default function Home(){
  const [cars, setCars] = useState<any[]>([])
  useEffect(()=>{ axios.get(`${API_URL}/api/cars`).then(r=>setCars(r.data)) },[])
  return (
    <div className="space-y-4">
      {cars.map(c => <CarCard key={c.id} car={c} />)}
    </div>
  )
}
