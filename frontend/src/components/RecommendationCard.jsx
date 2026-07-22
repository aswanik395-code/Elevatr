import { GraduationCap, Sparkles } from 'lucide-react'

export default function RecommendationCard({ rec }) {
  return (
    <div className="rounded-lg border border-paper-line bg-white p-5 paper-edge">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink">{rec.title}</h3>
          <p className="text-sm text-ink-soft">{rec.company}</p>
        </div>
        <GraduationCap className="h-5 w-5 shrink-0 text-pen" strokeWidth={1.75} />
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-sm leading-6 text-ink-soft">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-marker" />
        {rec.reason}
      </p>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Required skills
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {rec.requiredSkills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-paper-line bg-paper px-2.5 py-0.5 text-xs text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Eligibility</p>
        <p className="mt-1 text-sm text-ink-soft">{rec.eligibility}</p>
      </div>

      {rec.learningResources?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            To level up
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-ink-soft">
            {rec.learningResources.map((res) => (
              <li key={res}>{res}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
