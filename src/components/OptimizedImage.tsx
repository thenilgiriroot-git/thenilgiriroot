import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  /** Default src (used as fallback for browsers without webp/srcset support). */
  src: string;
  /** WebP variants by width (e.g. { 480: url, 768: url, 1024: url, 1440: url }). */
  webpSources: Record<number, string>;
  /** Tiny base64 (≈24px) preview used as a blurred placeholder. */
  blurDataURI?: string;
  alt: string;
  /** sizes attribute, e.g. "(min-width: 768px) 50vw, 100vw". */
  sizes?: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  onClick?: () => void;
  /** Optional rounded children overlay (icon, gradient). */
  children?: React.ReactNode;
}

/**
 * <OptimizedImage> — modern responsive <picture> with WebP + blur-up placeholder.
 *
 * Renders the blurred low-res preview behind a transparent <img> that fades in
 * once the full image is decoded. Reserves the correct aspect ratio via width/height
 * to avoid CLS.
 */
export default function OptimizedImage({
  src,
  webpSources,
  blurDataURI,
  alt,
  sizes = "(min-width: 768px) 50vw, 100vw",
  width = 1024,
  height = 640,
  className,
  imgClassName,
  loading = "lazy",
  fetchPriority,
  onClick,
  children,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const widths = Object.keys(webpSources)
    .map(Number)
    .sort((a, b) => a - b);
  const srcSet = widths.map((w) => `${webpSources[w]} ${w}w`).join(", ");

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Blur-up backdrop. Kept opacity-0 once full image is loaded for a smooth fade. */}
      {blurDataURI && (
        <img
          src={blurDataURI}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-opacity duration-700",
            loaded ? "opacity-0" : "opacity-100",
          )}
        />
      )}
      <picture>
        <source type="image/webp" srcSet={srcSet} sizes={sizes} />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      </picture>
      {children}
    </div>
  );
}
