import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  maxFiles?: number
  images: string[]
  onUpload: (url: string) => void
  onRemove: (index: number) => void
}

export default function ImageUpload({ maxFiles = 6, images, onUpload, onRemove }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const remainingSlots = maxFiles - images.length

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, JPEG, WebP)')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB')
        return
      }

      setUploading(true)

      try {
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result as string
          onUpload(dataUrl)
          setUploading(false)
        }
        reader.onerror = () => {
          setError('Failed to read image file')
          setUploading(false)
        }
        reader.readAsDataURL(file)
      } catch {
        setError('Upload failed. Please try again.')
        setUploading(false)
      }
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (remainingSlots <= 0) {
        setError(`Maximum ${maxFiles} images allowed`)
        return
      }

      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
      if (files.length === 0) {
        setError('Please drop image files only')
        return
      }

      const toProcess = files.slice(0, remainingSlots)
      toProcess.forEach((file, i) => {
        setTimeout(() => processFile(file), i * 100)
      })
    },
    [remainingSlots, maxFiles, processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      if (remainingSlots <= 0) {
        setError(`Maximum ${maxFiles} images allowed`)
        return
      }

      const toProcess = Array.from(files).slice(0, remainingSlots)
      toProcess.forEach((file, i) => {
        setTimeout(() => processFile(file), i * 100)
      })

      // Reset input so the same file can be selected again
      e.target.value = ''
    },
    [remainingSlots, maxFiles, processFile]
  )

  const handleClick = () => {
    if (uploading || remainingSlots <= 0) return
    inputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {remainingSlots > 0 && (
        <motion.div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-8
            flex flex-col items-center justify-center gap-3
            transition-colors duration-200
            ${isDragOver
              ? 'border-sunset bg-sunset/5'
              : 'border-light-grey hover:border-sunset hover:bg-warm-sand/30'
            }
            ${uploading || remainingSlots <= 0 ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />

          {uploading ? (
            <Loader2 size={32} className="text-sunset animate-spin" />
          ) : (
            <Upload
              size={32}
              className={`transition-colors ${isDragOver ? 'text-sunset' : 'text-slate'}`}
            />
          )}

          <div className="text-center">
            <p className="text-sm font-medium text-deep-forest">
              {uploading
                ? 'Uploading...'
                : isDragOver
                  ? 'Drop images here'
                  : 'Drag & drop images here, or click to browse'
              }
            </p>
            <p className="text-xs text-slate mt-1">
              {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining &middot; PNG, JPG, WebP up to 5MB
            </p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 flex items-center gap-2"
          >
            <X size={14} className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {images.map((url, idx) => (
              <motion.div
                key={`${url}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative group aspect-square rounded-xl overflow-hidden border border-light-grey bg-warm-sand"
              >
                {url ? (
                  <img
                    src={url}
                    alt={`Uploaded ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-slate" />
                  </div>
                )}

                {/* Remove Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onRemove(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm
                    shadow-md flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity
                    hover:bg-red-50 text-slate hover:text-red-500"
                >
                  <X size={14} />
                </motion.button>

                {/* Image Number Badge */}
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {idx + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Max Files Info */}
      {remainingSlots <= 0 && (
        <p className="text-xs text-slate text-center">
          Maximum {maxFiles} images reached. Remove an image to add more.
        </p>
      )}
    </div>
  )
}
