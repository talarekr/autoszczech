import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LangSwitch from './components/LangSwitch'

export default function App(){
  const { t } = useTranslation()
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-yellow-400">{t('title')}</Link>
          <nav className="text-sm flex items-center gap-4">
            <Link to="/" className="hover:text-yellow-400">Home</Link>
            <Link to="/admin" className="hover:text-yellow-400">Admin</Link>
            <LangSwitch />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
