import Avatar from '@/components/atoms/Avatar'

export default function UserInfo({ profile, collapsed }) {
  if (collapsed) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
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
  )
}