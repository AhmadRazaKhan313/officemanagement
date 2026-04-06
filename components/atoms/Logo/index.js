import { Building2 } from 'lucide-react'

export default function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Building2 size={18} className="text-white" />
      </div>
      {!collapsed && (
        <span className="text-white font-bold text-base">Office Manager</span>
      )}
    </div>
  )
}