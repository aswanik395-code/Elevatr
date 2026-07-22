import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileCheck2, AlertTriangle } from 'lucide-react'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB, per the security requirements in the spec

export default function UploadZone({ onFileAccepted }) {
  const [error, setError] = useState('')

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError('')
      if (rejectedFiles?.length) {
        const reason = rejectedFiles[0].errors?.[0]?.code
        if (reason === 'file-too-large') {
          setError('That file is over 5MB. Try a lighter PDF export.')
        } else if (reason === 'file-invalid-type') {
          setError('Only PDF resumes are supported right now.')
        } else {
          setError('Could not read that file. Please try another PDF.')
        }
        return
      }
      const file = acceptedFiles[0]
      if (file) onFileAccepted(file)
    },
    [onFileAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    multiple: false,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`group cursor-pointer rounded-lg border-2 border-dashed px-8 py-12 text-center transition-colors ${
          isDragActive
            ? 'border-pen bg-pen/5'
            : 'border-paper-line bg-white/60 hover:border-ink-soft/40'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud
          className={`mx-auto h-8 w-8 transition-colors ${
            isDragActive ? 'text-pen' : 'text-ink-soft/60 group-hover:text-ink-soft'
          }`}
          strokeWidth={1.5}
        />
        <p className="mt-4 font-display text-lg text-ink">
          {isDragActive ? 'Drop it right here' : 'Drag your resume in, or click to browse'}
        </p>
        <p className="mt-1 text-sm text-ink-soft">PDF only · under 5MB</p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-pen">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

export function FileChip({ file }) {
  if (!file) return null
  return (
    <div className="mt-4 flex items-center gap-2 rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink-soft">
      <FileCheck2 className="h-4 w-4 text-sage" />
      <span className="truncate">{file.name}</span>
    </div>
  )
}