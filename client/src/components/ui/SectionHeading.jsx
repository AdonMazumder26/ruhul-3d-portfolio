export function SectionHeading({ eyebrow, title, description, align = 'left', as: Tag = 'h2', id }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <Tag id={id} className="text-3xl sm:text-4xl leading-tight">
        {title}
      </Tag>
      {description ? <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{description}</p> : null}
    </div>
  )
}
