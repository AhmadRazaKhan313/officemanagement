'use client'

import { useSelector } from 'react-redux'
import { Bell, HelpCircle } from 'lucide-react'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'

export default function Header() {
  const { profile } = useSelector((state) => state.auth)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">

      {/* Left - Company Name */}
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {profile?.companies?.name || 'Office Manager'}
        </p>
        <p className="text-xs text-gray-400">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-500" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <HelpCircle size={18} className="text-gray-500" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <Badge
          label={profile?.role?.replace('_', ' ') || ''}
          variant="blue"
        />
        <Avatar name={profile?.full_name} size="sm" />
      </div>

    </header>
  )
}