'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { setUser, clearUser } from '@/store/slices/authSlice'
import {
  LayoutDashboard, Users, FolderKanban,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, UserCog, ShoppingCart 
} from 'lucide-react'
import Logo from '@/components/atoms/Logo'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import { useState } from 'react'

const menuItems = [
  { label: 'Dashboard', href: '/OrgDashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/OrgEmployees', icon: Users },
  { label: 'Departments', href: '/OrgDepartments', icon: FolderKanban },
    { label: 'Orders', href: '/OrgOrders', icon: ShoppingCart },
  { label: 'Users', href: '/OrgUsers', icon: UserCog },
  { label: 'Settings', href: '/OrgSettings', icon: Settings },
]

export default function OrgLayout({ children }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { profile } = useSelector((state) => state.auth)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, companies(name, status)')
          .eq('id', user.id)
          .maybeSingle()

        dispatch(setUser({
          user: { id: user.id, email: user.email },
          profile: { ...profile, id: user.id }
        }))
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    router.push('/Login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 flex flex-col fixed h-full z-10 transition-all duration-300`}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <Logo collapsed={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Company Info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 size={14} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">
                  {profile?.companies?.name || 'Organization'}
                </p>
                <p className="text-slate-400 text-xs">Organization</p>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar name={profile?.full_name} size="sm" />
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-slate-400 text-xs capitalize">
                  {profile?.role?.replace('_', ' ') || ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {profile?.companies?.name || 'Organization'}
            </p>
            <p className="text-xs text-gray-400">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge label={profile?.role?.replace('_', ' ') || ''} variant="blue" />
            <Avatar name={profile?.full_name} size="sm" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  )
}