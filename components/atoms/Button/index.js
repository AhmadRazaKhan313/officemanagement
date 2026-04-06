const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white',
  outline: 'border border-gray-200 hover:bg-gray-50 text-gray-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        flex items-center gap-2 rounded-lg font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}