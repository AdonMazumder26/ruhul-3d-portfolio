import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'
import { journey } from '../../data/journey.js'

export function JourneySection() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="section-y scroll-mt-20 border-t border-border/60">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            id="journey-title"
            eyebrow="Journey"
            title="Where the path has led so far"
            description="Education and the project milestones that shaped how I build."
          />
        </Reveal>

        <ol className="relative mt-12 space-y-8 border-l border-border/80 pl-8 sm:pl-10">
          {journey.map((item, index) => (
            <Reveal as="li" key={item.id} delay={index * 0.07} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[2.56rem] top-1.5 grid size-5 place-items-center rounded-full border bg-bg sm:-left-[3.06rem] ${
                  index === 0 ? 'border-orange' : 'border-cyan/70'
                }`}
              >
                <span className={`size-1.5 rounded-full ${index === 0 ? 'bg-orange' : 'bg-cyan'}`} />
              </span>
              <div className="card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={index === 0 ? 'orange' : 'cyan'}>{item.kind}</Badge>
                  {item.period ? <span className="font-mono text-xs text-muted">{item.period}</span> : null}
                </div>
                <h3 className="mt-3 text-lg sm:text-xl">{item.title}</h3>
                <p className="mt-1 text-sm text-cyan/90">{item.place}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
