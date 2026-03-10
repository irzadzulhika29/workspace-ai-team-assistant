/**
 * SkeletonLoader — shimmer placeholder for AI responses
 * @param {Object} props
 * @param {'message'|'card'|'line'} props.variant
 * @param {number}  props.lines
 */
export default function SkeletonLoader({ variant = 'message', lines = 3 }) {
  if (variant === 'line') {
    return <span className="skeleton inline-block h-4 rounded w-32" />
  }

  if (variant === 'card') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3 w-full max-w-md">
        <div className="skeleton h-4 rounded w-1/2" />
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-2/3" />
      </div>
    )
  }

  // Default: message bubble skeleton
  return (
    <div className="flex gap-3 items-start animate-fade-in">
      <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-sm">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}
