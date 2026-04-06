const variants = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600',
}

export default function Badge({ label, variant = 'blue' }) {
  return (
    <span className={`${variants[variant]} text-xs font-medium px-2.5 py-1 rounded-full capitalize`}>
      {label}
    </span>
  )
}