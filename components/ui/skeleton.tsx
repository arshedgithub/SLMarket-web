interface SkeletonProps {
  className?: string;
  // For placement on dark/colored backgrounds (e.g. the homepage hero
  // gradient) where the default shimmer gradient's own background would
  // just paint over a bg-white/* override and look identical to the page.
  light?: boolean;
}

export function Skeleton({ className = "", light = false }: SkeletonProps) {
  // Default corners only when the caller didn't choose their own (a
  // rounded-full avatar must stay a circle).
  const corners = /\brounded(-|\b)/.test(className) ? "" : "rounded-md";
  if (light) {
    return (
      <div className={`bg-white/20 animate-pulse ${corners} ${className}`} />
    );
  }
  return <div className={`skeleton-shimmer ${corners} ${className}`} />;
}
