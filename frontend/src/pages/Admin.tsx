import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../lib/api'

function useAuth(){
  const [token, setToken] = useState<string | null>(()=> localStorage.getItem('token'))
  const login = async (email:string, password:string)=>{
    const r = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    localStorage.setItem('token', r.data.token)
    setToken(r.data.token)
  }
  const logout = ()=>{ localStorage.removeItem('token'); setToken(null) }
  return { token, login, logout }
}

export default function Admin(){
  const { token, login, logout } = useAuth()
  const [email, setEmail] = useState('talarekr@gmail.com')
  const [password, setPassword] = useState('ChangeMe123!')
  const [cars, setCars] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])

  useEffect(()=>{ if(token){ axios.get(`${API_URL}/api/cars`).then(r=>setCars(r.data)) } },[token])
  useEffect(()=>{ if(token){ axios.get(`${API_URL}/api/offers`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>setOffers(r.data)) } },[token])

  if(!token){
    return (
      <div className="max-w-sm mx-auto bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
        <h2 className="text-xl font-bold mb-4">Panel administratora</h2>
        <div className="space-y-3">
          <input className="w-full bg-neutral-800 rounded p-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full bg-neutral-800 rounded p-2" placeholder="Hasło" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={()=>login(email,password)} className="w-full bg-yellow-400 text-black rounded p-2 font-semibold">Zaloguj</button>
        </div>
        <p className="text-xs text-neutral-400 mt-3">Użyj danych z README lub zmień po wdrożeniu.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel administratora</h1>
        <button onClick={logout} className="px-3 py-1 bg-neutral-800 rounded border border-neutral-700">Wyloguj</button>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Samochody</h2>
        <div className="grid gap-3">
          {cars.map(c=> (
            <div key={c.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.make} {c.model}</div>
                <div className="text-sm text-neutral-400">{c.year} · {c.mileage.toLocaleString()} km · {c.price} zł</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Złożone oferty</h2>
        <div className="grid gap-3">
          {offers.map((o:any)=> (
            <div key={o.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
              <div className="text-sm text-neutral-400">#{o.id} • {new Date(o.createdAt).toLocaleString()}</div>
              <div className="font-semibold">{o.user?.email} → {o.car?.make} {o.car?.model}</div>
              <div>Kwota: <span className="text-yellow-400 font-bold">{o.amount} zł</span></div>
              {o.message && <div className="text-sm text-neutral-300">„{o.message}”</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
