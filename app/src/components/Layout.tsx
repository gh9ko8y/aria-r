import { Outlet } from 'react-router'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--bg-cream)]">
      <Navbar />

      {/* Desktop: sidebar offset + mobile: top bar offset + mobile bottom tab padding */}
      <main className="lg:ml-[220px] pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-6 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
