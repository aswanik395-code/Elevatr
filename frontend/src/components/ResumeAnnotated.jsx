import { CheckCircle2, XCircle } from 'lucide-react'

// The signature element: your resume rendered as a "graded paper", with
// margin notes exactly like a recruiter marking it up by hand.
export default function ResumeAnnotated({ annotations }) {
  return (
    <div className="relative rounded-sm bg-white paper-edge">
      {/* faint ruled lines to sell the "paper" feel */}
      <div
        className="pointer-events-none absolute inset-0 rounded-sm"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 27px, #EFEAE0 28px)',
          backgroundSize: '100% 28px',
        }}
      />
      <div className="relative space-y-5 p-8">
        {annotations.map((a, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-4">
            <p
              className={`font-mono text-sm leading-7 ${
                a.type === 'weak' ? 'text-ink-soft line-through decoration-pen/60' : 'text-ink'
              }`}
            >
              {a.line}
            </p>
            <div className="w-56 shrink-0">
              <div
                className={`flex items-start gap-1.5 text-xs leading-5 ${
                  a.type === 'weak' ? 'text-pen' : 'text-sage'
                }`}
                style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic' }}
              >
                {a.type === 'weak' ? (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span>{a.note}</span>
              </div>
              {a.rewrite && (
                <p className="mt-1 rounded bg-marker/20 px-2 py-1 text-xs leading-5 text-ink">
                  → {a.rewrite}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}