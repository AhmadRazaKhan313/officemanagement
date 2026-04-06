import Sidebar from '@/components/organisms/Sidebar'
import Header from '@/components/organisms/Header'

export default function DashboardTemplate({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}