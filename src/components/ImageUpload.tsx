import { useState, useRef } from 'react'
import { Upload, X, Image, Film, Loader } from 'lucide-react'
import { trpc } from '../providers/trpc'

interface ImageUploadProps {
  images: string[]
  videos: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
  maxImages?: number
  maxVideos?: number
}

export default function ImageUpload({ images, videos, onImagesChange, onVideosChange, maxImages = 10, maxVideos = 3 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      if (data.url) onImagesChange([...images, data.url])
      setUploading(null)
    },
    onError: () => setUploading(null),
  })

  const uploadVideo = trpc.upload.video.useMutation({
    onSuccess: (data) => {
      if (data.url) onVideosChange([...videos, data.url])
      setUploading(null)
    },
    onError: () => setUploading(null),
  })

  const handleFile = (file: File, type: "image" | "video") => {
    if (type === "image" && images.length >= maxImages) return
    if (type === "video" && videos.length >= maxVideos) return

    setUploading(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      if (type === "image") {
        uploadImage.mutate({ file: base64, filename: file.name })
      } else {
        uploadVideo.mutate({ file: base64, filename: file.name })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(f => {
      if (f.type.startsWith("image/")) handleFile(f, "image")
      else if (f.type.startsWith("video/")) handleFile(f, "video")
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = Array.from(e.target.files || [])
    files.forEach(f => handleFile(f, type))
    e.target.value = "" // reset
  }

  return (
    <div>
      {/* Drag & drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={(dragActive ? "border-sunset bg-sunset/5" : "border-gray-700 bg-deep-forest") + " border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-sunset transition-colors"}
      >
        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-300 font-medium">Drag & drop photos or videos here</p>
        <p className="text-gray-500 text-sm mt-1">or click to browse</p>
        <p className="text-gray-600 text-xs mt-2">Images: up to {maxImages} · Videos: up to {maxVideos} · Max 5MB per image, 50MB per video</p>
      </div>

      {/* Hidden inputs */}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleChange(e, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={e => handleChange(e, "video")} />

      {/* Uploading indicator */}
      {uploading && (
        <div className="flex items-center gap-2 text-savanna-gold text-sm mt-3">
          <Loader className="w-4 h-4 animate-spin" /> Uploading {uploading}...
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-2 flex items-center gap-1"><Image className="w-4 h-4" /> {images.length} photo{images.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={e => { e.stopPropagation(); onImagesChange(images.filter((_, j) => j !== i)) }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video previews */}
      {videos.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-2 flex items-center gap-1"><Film className="w-4 h-4" /> {videos.length} video{videos.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 gap-3">
            {videos.map((url, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden group">
                <video src={url} className="w-full aspect-video object-cover" controls />
                <button
                  onClick={e => { e.stopPropagation(); onVideosChange(videos.filter((_, j) => j !== i)) }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Separate video upload button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); videoInputRef.current?.click() }}
        disabled={videos.length >= maxVideos || !!uploading}
        className="mt-3 text-sm text-sunset hover:text-savanna-gold transition-colors disabled:text-gray-600"
      >
        + Add video{videos.length > 0 ? " (" + videos.length + "/" + maxVideos + ")" : ""}
      </button>
    </div>
  )
}
