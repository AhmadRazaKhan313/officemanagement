import Link from 'next/link'

export default function NavItem({ href, icon: Icon, label, isActive, collapsed }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-slate-700 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}