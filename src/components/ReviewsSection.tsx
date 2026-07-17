import { useState } from 'react'
import { Star, User, ThumbsUp, MessageCircle } from 'lucide-react'
import { trpc } from '../providers/trpc'

interface ReviewsSectionProps {
  propertyId: number
  userId?: number
  userName?: string
}

export default function ReviewsSection({ propertyId, userId = 1, userName = "Guest" }: ReviewsSectionProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [userType, setUserType] = useState<"guest" | "host">("guest")
  const [success, setSuccess] = useState("")

  const { data: reviews, isLoading, refetch } = trpc.review.list.useQuery({ propertyId })
  const { data: stats } = trpc.review.stats.useQuery({ propertyId })

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setSuccess("Review submitted!")
      setComment("")
      setRating(5)
      refetch()
      setTimeout(() => setSuccess(""), 3000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim().length < 5) return
    createReview.mutate({ propertyId, userId, userName, userType, rating, comment })
  }

  const ratingLabels = ["Terrible", "Poor", "Average", "Good", "Excellent"]

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-sunset" /> Reviews & Ratings
      </h2>

      {/* Stats */}
      {stats && stats.count > 0 && (
        <div className="bg-midnight rounded-xl p-6 mb-8 flex flex-wrap gap-8 items-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-savanna-gold">{stats.average}</div>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={(s <= Math.round(stats.average) ? "text-savanna-gold fill-current" : "text-gray-600") + " w-4 h-4"} />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-1">{stats.count} review{stats.count !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-gray-300"><span className="text-green-400 font-semibold">{stats.guestCount}</span> from guests</div>
            <div className="text-gray-300"><span className="text-sunset font-semibold">{stats.hostCount}</span> from hosts</div>
          </div>
        </div>
      )}

      {/* Submit review */}
      <form onSubmit={handleSubmit} className="bg-midnight rounded-xl p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">Write a Review</h3>
        {success && <p className="text-green-400 text-sm mb-3">{success}</p>}
        {createReview.error && <p className="text-red-400 text-sm mb-3">{createReview.error.message}</p>}

        <div className="flex gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">I am a</label>
            <div className="flex gap-2">
              {(["guest", "host"] as const).map(t => (
                <button key={t} type="button" onClick={() => setUserType(t)} className={(userType === t ? "bg-sunset text-white" : "bg-deep-forest text-gray-400") + " px-3 py-1.5 rounded-full text-sm capitalize transition-colors"}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)} className="focus:outline-none">
                  <Star className={(s <= rating ? "text-savanna-gold fill-current" : "text-gray-600") + " w-6 h-6 hover:scale-110 transition-transform"} />
                </button>
              ))}
            </div>
            <p className="text-savanna-gold text-xs mt-0.5">{ratingLabels[rating - 1]}</p>
          </div>
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-sunset focus:outline-none mb-3"
        />
        <button
          type="submit"
          disabled={createReview.isPending || comment.trim().length < 5}
          className="bg-sunset hover:bg-sunset/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {createReview.isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* Review list */}
      {isLoading ? (
        <p className="text-gray-400 text-center py-8">Loading reviews...</p>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-midnight rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={(review.userType === "host" ? "bg-sunset" : "bg-teal-depth") + " w-10 h-10 rounded-full flex items-center justify-center text-white"}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{review.userName}</p>
                    <span className={(review.userType === "host" ? "text-sunset" : "text-teal-400") + " text-xs capitalize"}>{review.userType}</span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={(s <= review.rating ? "text-savanna-gold fill-current" : "text-gray-600") + " w-4 h-4"} />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
              <p className="text-gray-500 text-xs mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
      )}
    </div>
  )
}
