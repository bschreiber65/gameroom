export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-muted font-medium">{label}</label>
      )}
      <input
        className={`bg-dark border border-white/20 rounded px-3 py-2 text-text placeholder-muted/50 focus:outline-none focus:border-primary transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </div>
  )
}
