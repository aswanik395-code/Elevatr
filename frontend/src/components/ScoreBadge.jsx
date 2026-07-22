function colorFor(score) {
  if (score >= 80) return { ring: '#3F8F5F', text: 'text-sage' }
  if (score >= 60) return { ring: '#F2C230', text: 'text-ink' }
  return { ring: '#C1401F', text: 'text-pen' }
}

export default function ScoreBadge({ score, size = 120, label }) {
  const { ring, text } = colorFor(score)
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E7E0D2"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-3xl font-bold ${text}`}>{score}</span>
          <span className="text-xs text-ink-soft">/ 100</span>
        </div>
      </div>
      {label && <p className="mt-2 text-sm font-medium text-ink-soft">{label}</p>}
    </div>
  )
}