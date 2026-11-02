import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-200 min-h-11 px-6 text-sm sm:text-[15px] select-none disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]'

const variants = {
  primary: 'bg-cyan text-bg hover:bg-[#8df0fb] border border-cyan',
  secondary: 'border border-border bg-surface/70 text-text hover:border-cyan/60 hover:bg-elevated',
  ghost: 'text-muted hover:text-text px-3',
}

export function Button({ as, to, href, variant = 'primary', className = '', children, ...rest }) {
  const classes = `${base} ${variants[variant] ?? variants.primary} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  const Component = as ?? 'button'
  return (
    <Component type={Component === 'button' ? rest.type ?? 'button' : undefined} className={classes} {...rest}>
      {children}
    </Component>
  )
}
