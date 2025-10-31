import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">AutoSzczech</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/">Oferty</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
