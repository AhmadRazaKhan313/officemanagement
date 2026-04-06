'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { createClient } from '@/lib/supabase/client'
import { clearUser } from '@/store/slices/authSlice'
import Logo from '@/components/atoms/Logo'
import NavItem from '@/components/molecules/NavItem'
import UserInfo from '@/components/molecules/UserInfo'
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCog 
} from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/Dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/Companies', icon: Building2 },
    { label: 'Users', href: '/Users', icon: UserCog },
  { label: 'Employees', href: '/Employees', icon: Users },
  { label: 'Departments', href: '/Departments', icon: FolderKanban },
  { label: 'Settings', href: '/Settings', icon: Settings },
]


export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const supabase = createClient()
  const { profile } = useSelector((state) => state.auth)
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    router.push('/Login')
    router.refresh()
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 flex flex-col fixed h-full z-10 transition-all duration-300`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        <Logo collapsed={collapsed} />
        {/* <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 transition-colors flex-shrink-0"
        >
          {collapsed
            ? <ChevronRight size={18} />
            : <ChevronLeft size={18} />
          }
        </button> */}
      </div>
      <UserInfo profile={profile} collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-[#C7322E] transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </aside>
  )
}'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Building2, Users, FolderKanban,
  LogOut, ChevronLeft, ChevronRight, Settings, UserCog, Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clearUser } from '@/store/slices/authSlice'
import Logo from '@/components/atoms/Logo'
import NavItem from '@/components/molecules/NavItem'
import UserInfo from '@/components/molecules/UserInfo'

const superAdminMenu = [
  { label: 'Dashboard', href: '/Dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/Companies', icon: Building2 },
  { label: 'Users', href: '/Users', icon: UserCog },
  { label: 'Employees', href: '/Employees', icon: Users },
  { label: 'Departments', href: '/Departments', icon: FolderKanban },
  { label: 'Settings', href: '/Settings', icon: Settings },
]

const orgAdminMenu = [
  { label: 'Dashboard', href: '/OrgDashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/OrgEmployees', icon: Users },
  { label: 'Departments', href: '/OrgDepartments', icon: FolderKanban },
  { label: 'Users', href: '/OrgUsers', icon: UserCog },
  { label: 'Settings', href: '/OrgSettings', icon: Settings },
]

const deptManagerMenu = [
  { label: 'Dashboard', href: '/OrgDashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/OrgEmployees', icon: Users },
  { label: 'Departments', href: '/OrgDepartments', icon: FolderKanban },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const supabase = createClient()
  const { profile } = useSelector((state) => state.auth)
  const [collapsed, setCollapsed] = useState(false)

  // Role ke hisaab se menu select karo
  const getMenuItems = () => {
    switch (profile?.role) {
      case 'super_admin': return superAdminMenu
      case 'org_admin': return orgAdminMenu
      case 'dept_manager': return deptManagerMenu
      default: return []
    }
  }

  const menuItems = getMenuItems()

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    router.push('/Login')
    router.refresh()
  }

  return (
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

      {/* User Info */}
      <UserInfo profile={profile} collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
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
  )
}