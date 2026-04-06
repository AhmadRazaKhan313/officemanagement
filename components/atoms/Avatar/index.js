export default function Avatar({ name, size = 'md' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div className={`${sizes[size]} bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}