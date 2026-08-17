import { useEffect, useRef, useState } from "react";
import type { StageMedia } from "@/assets/stages";

interface StageVideoProps {
  media: StageMedia;
  /** Accessible description of what the clip shows. */
  label: string;
  /** Skip video entirely and render the poster frame. */
  staticOnly?: boolean;
  /** Load and play as soon as mounted rather than waiting for visibility. */
  eager?: boolean;
  className?: string;
}

/**
 * A looping, muted process clip that costs nothing until it is looked at.
 *
 * `preload="none"` means the browser fetches no video bytes on page load — the
 * poster WebP (roughly 30 KB) is all that arrives. An IntersectionObserver
 * starts playback when the clip scrolls into view and pauses it when it leaves,
 * so an idle stage never burns decode time or battery.
 *
 * With `prefers-reduced-motion`, or on the linear mobile layout where ten
 * simultaneously-decoding videos would swamp the device, `staticOnly` renders
 * just the poster and no <video> element is created at all.
 */
export default function StageVideo({
  media,
  label,
  staticOnly = false,
  eager = false,
  className = "",
}: StageVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (staticOnly) return;
    const el = videoRef.current;
    if (!el) return;

    const play = () => {
      // play() rejects if the browser blocks autoplay (or the element is
      // detached mid-scroll). Muted + playsInline satisfies every current
      // autoplay policy, but swallow the rejection rather than throwing an
      // unhandled promise into the console.
      el.play().catch(() => {});
    };

    if (eager) {
      play();
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else el.pause();
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      el.pause();
    };
  }, [staticOnly, eager]);

  if (staticOnly) {
    return (
      <img
        src={media.poster}
        alt={label}
        width={960}
        height={540}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <>
      {/* Poster stands in until the first frame decodes, so the box is never
          empty and nothing shifts when the video takes over. */}
      <img
        src={media.poster}
        alt=""
        aria-hidden="true"
        width={960}
        height={540}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-base ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={media.poster}
        aria-label={label}
        width={960}
        height={540}
        onLoadedData={() => setReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-base ${
          ready ? "opacity-100" : "opacity-0"
        } ${className}`}
      >
        <source src={media.webm} type="video/webm" />
        <source src={media.mp4} type="video/mp4" />
      </video>
    </>
  );
}
