import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'
import { profile } from '../../data/profile.js'

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y scroll-mt-20 border-t border-border/60">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative aspect-square">
            <div aria-hidden="true" className="absolute inset-0 rounded-full border border-border/80" />
            <div
              aria-hidden="true"
              className="absolute inset-[7%] rounded-full border border-cyan/35"
              style={{ transform: 'rotate(-18deg) scaleY(0.92)' }}
            />
            <span aria-hidden="true" className="absolute left-[6%] top-[28%] size-2.5 rounded-full bg-orange shadow-[0_0_14px_var(--color-orange)]" />
            <span aria-hidden="true" className="absolute bottom-[14%] right-[10%] size-2 rounded-full bg-cyan shadow-[0_0_14px_var(--color-cyan)]" />
            <div className="absolute inset-[14%] overflow-hidden rounded-full border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(103,232,249,0.35)]">
              <img
                src={profile.avatar.src}
                alt={profile.avatar.alt}
                width="600"
                height="600"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {profile.fullName}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeading
            id="about-title"
            eyebrow="About"
            title={`Hi, I'm ${profile.preferredName}.`}
          />
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted sm:text-base">
            {profile.aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="card p-5">
              <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Education</dt>
              <dd className="mt-2 text-sm text-text">
                {profile.education.degree}
                <span className="block text-muted">
                  {profile.education.institution}, {profile.education.location}
                </span>
              </dd>
            </div>
            <div className="card p-5">
              <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Direction</dt>
              <dd className="mt-2 text-sm text-text">
                {profile.role}
                <span className="block text-muted">{profile.availability}</span>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
