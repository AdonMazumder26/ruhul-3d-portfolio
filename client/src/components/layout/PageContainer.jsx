export function PageContainer({ className = '', children }) {
  return <div className={`container-x pt-28 pb-20 sm:pt-32 ${className}`}>{children}</div>
}
