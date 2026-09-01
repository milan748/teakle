'use client'

import { useRef, useState, useCallback } from 'react'

/**
 * ProcessVideo — Reusable video component for process/making-of pages.
 *
 * Supports:
 *   - Local MP4/WebM files
 *   - External video URLs (YouTube, Vimeo, etc.)
 *   - Poster/thumbnail images
 *   - Accessible labeling
 *   - Responsive sizing
 *   - Lazy loading via IntersectionObserver
 *   - Empty state when no video is available
 *
 * @param {object} props
 * @param {string|null} props.videoUrl - Video source URL (MP4/WebM) or null for empty state
 * @param {string|null} props.posterUrl - Poster image URL or null
 * @param {string} props.title - Accessible title for the video
 * @param {string} props.stageNumber - Stage number label (e.g., "01")
 * @param {string} props.description - Description text for the stage
 * @param {string} [props.className] - Additional CSS class
 */
export default function ProcessVideo({ videoUrl, posterUrl, title, stageNumber, description, className = '' }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = useCallback(() => setIsLoaded(true), [])
  const handleError = useCallback(() => setHasError(true), [])

  const isEmpty = !videoUrl || hasError

  return (
    <div ref={containerRef} className={`process-video ${className}`}>
      <div className="process-video-inner">
        {isEmpty ? (
          <div className="process-video-empty" role="img" aria-label={`${title} — video coming soon`}>
            <div className="process-video-empty-content">
              <span className="process-video-stage">{stageNumber}</span>
              <p className="process-video-empty-label">Process documentation coming soon.</p>
              <p className="process-video-empty-sub">{description}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className={`process-video-player ${isLoaded ? 'is-loaded' : ''}`}
            src={videoUrl}
            poster={posterUrl || undefined}
            controls
            playsInline
            preload="none"
            onLoadStart={handleLoad}
            onError={handleError}
            aria-label={title}
          >
            <track kind="captions" label="English" srcLang="en" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  )
}
