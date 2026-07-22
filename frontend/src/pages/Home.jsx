import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadZone, { FileChip } from '../components/UploadZone.jsx'

export default function Home() {
  const [file, setFile] = useState(null)
  const navigate = useNavigate()

  const handleFile = (f) => {
    setFile(f)
    // Small delay so the person sees their file was accepted before we jump.
    setTimeout(() => {
      navigate('/analysis', { state: { file: f, fileName: f.name } })
    }, 500)
  }

  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pen">
            Elevatr-Resume coach
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.1] text-ink md:text-5xl">
            Get your resume{' '}
            <span className="italic text-pen-soft">graded</span> before a
            recruiter does.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">
            Upload your resume and get an honest, line-by-line mark-up: an
            ATS score, what's working, what's not, and exactly how to fix it —
            in seconds, not a week of waiting for feedback.
          </p>

          <ul className="mt-8 space-y-2 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              ATS compatibility score with a category breakdown
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              Line-by-line strengths and weaknesses, like a red pen would leave
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              Rewrites for weak bullet points, ready to paste in
            </li>
          </ul>
        </div>

        <div className="self-start rounded-lg border border-paper-line bg-white/60 p-6 paper-edge">
          <h2 className="font-display text-lg text-ink">Upload your resume</h2>
          <p className="mt-1 text-sm text-ink-soft">
            We only read it to generate your report — nothing is shared.
          </p>
          <div className="mt-5">
            <UploadZone onFileAccepted={handleFile} />
            <FileChip file={file} />
          </div>
        </div>
      </section>
    </main>
  )
}