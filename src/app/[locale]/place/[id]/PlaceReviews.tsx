'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Trash2, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import StarRating from '@/components/shared/StarRating'
import type { Place, Review } from '@/types'
import type { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/utils'

interface PlaceReviewsProps {
  place: Place
  reviews: Review[]
  locale: string
  userId: string | null
  t: ReturnType<typeof useTranslations>
}

export default function PlaceReviews({ place, reviews: initialReviews, locale, userId, t }: PlaceReviewsProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const isRtl = locale === 'ar'

  const userReview = reviews.find((r) => r.user_id === userId)

  async function submitReview() {
    if (!userId) {
      router.push(`/${locale}/sign-in`)
      return
    }
    if (rating === 0) {
      toast.error(locale === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating')
      return
    }
    setSubmitting(true)
    const supabase = createClient()
    const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).maybeSingle()

    const { data, error } = await supabase.from('reviews').upsert({
      user_id: userId,
      place_id: place.id,
      rating,
      comment,
      user_name: profile?.full_name || 'Anonymous',
      avatar_url: profile?.avatar_url || null,
    }, { onConflict: 'user_id,place_id' }).select().single()

    if (error) {
      toast.error(error.message)
    } else {
      const updated = reviews.filter((r) => r.user_id !== userId)
      setReviews([data, ...updated])
      setRating(0)
      setComment('')
      setEditingId(null)
      toast.success(locale === 'ar' ? 'تم إرسال تقييمك!' : 'Review submitted!')
    }
    setSubmitting(false)
  }

  async function deleteReview(reviewId: string) {
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', reviewId)
    setReviews(reviews.filter((r) => r.id !== reviewId))
    toast.success(locale === 'ar' ? 'تم حذف التقييم' : 'Review deleted')
  }

  function startEdit(review: Review) {
    setRating(review.rating)
    setComment(review.comment || '')
    setEditingId(review.id)
  }

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow border border-border/30" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary-lighter flex items-center justify-center">
          <Star size={16} className="text-primary" />
        </div>
        <h2 className="font-bold font-sans text-foreground">
          {t('reviewsCount')} ({reviews.length})
        </h2>
      </div>

      {/* Write review form */}
      {(!userReview || editingId) && (
        <div className="mb-5 p-4 bg-muted rounded-2xl space-y-3">
          <h3 className="text-sm font-bold font-sans">{editingId ? t('editReview') : t('writeReview')}</h3>
          <StarRating rating={rating} size={28} interactive onRate={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviewComment')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            onClick={submitReview}
            disabled={submitting || (!userId)}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm font-sans disabled:opacity-50 transition-opacity active:opacity-80"
          >
            {!userId ? t('logInToReview') : submitting ? '...' : t('submitReview')}
          </button>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground font-sans text-center py-4">
          {locale === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيّم!' : 'No reviews yet. Be the first to review!'}
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-muted overflow-hidden">
                {review.avatar_url ? (
                  <Image src={review.avatar_url} alt={review.user_name || ''} width={36} height={36} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {(review.user_name || 'A')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold font-sans">{review.user_name || 'Anonymous'}</p>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-sans">{formatDate(review.created_at, locale)}</span>
                    {(review.user_id === userId) && (
                      <>
                        <button onClick={() => startEdit(review)} className="p-1 hover:bg-muted rounded transition-colors">
                          <Pencil size={12} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => deleteReview(review.id)} className="p-1 hover:bg-destructive-light rounded transition-colors">
                          <Trash2 size={12} className="text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-foreground/80 font-sans mt-1 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
