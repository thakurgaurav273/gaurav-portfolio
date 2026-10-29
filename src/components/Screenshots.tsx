import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrowserFrame } from '@/components/ProjectCard';
import { cn } from '@/lib/utils';
import { optimizeImage, type Screenshot } from '@/lib/content';

type ShotProps = { shot: Screenshot; title: string; priority?: boolean };

// The image alone: a browser window for desktop screenshots, a phone outline for mobile ones.
const ShotFrame = ({ shot, title, priority = false }: ShotProps) =>
  shot.orientation === 'mobile' ? (
    <div className="frame mx-auto w-full max-w-[280px] rounded-[2rem] p-2">
      <img
        src={optimizeImage(shot.url, 600)}
        alt={shot.alt || shot.label || ''}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="block h-auto w-full rounded-[1.5rem] bg-muted"
      />
    </div>
  ) : (
    <BrowserFrame
      src={shot.url}
      alt={shot.alt || shot.label || title}
      label={shot.label ? `${title} / ${shot.label}` : title}
      width={1800}
      priority={priority}
    />
  );

const Caption = ({ shot }: { shot: Screenshot }) =>
  shot.label || shot.caption ? (
    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
      {shot.label && <span className="font-medium text-foreground">{shot.label}. </span>}
      {shot.caption}
    </p>
  ) : null;

export const Shot = (props: ShotProps) => (
  <figure>
    <ShotFrame {...props} />
    <figcaption className="mt-4">
      <Caption shot={props.shot} />
    </figcaption>
  </figure>
);

const pad = (n: number) => String(n).padStart(2, '0');

/*
  Several screenshots, one at a time. Swipe or drag, use the arrows, press ←/→ while it
  has focus, or pick a thumbnail. The caption follows the visible slide.
  A single screenshot renders as a plain Shot.
*/
export const ScreenshotCarousel = ({ shots, title }: { shots: Screenshot[]; title: string }) => {
  const [viewportRef, embla] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    onSelect();
    embla.on('select', onSelect).on('reInit', onSelect);
    return () => {
      embla.off('select', onSelect).off('reInit', onSelect);
    };
  }, [embla]);

  const go = useCallback((i: number) => embla?.scrollTo(i), [embla]);

  if (shots.length === 1) return <Shot shot={shots[0]} title={title} />;

  const active = shots[index] ?? shots[0];
  const atStart = index === 0;
  const atEnd = index === shots.length - 1;

  const arrow = 'grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-foreground/30 disabled:pointer-events-none disabled:opacity-35';

  return (
    <figure
      aria-roledescription="carousel"
      aria-label={`${title} screenshots`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') embla?.scrollPrev();
        if (e.key === 'ArrowRight') embla?.scrollNext();
      }}
      className="min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      {/* Bottom padding keeps the frame's shadow from being clipped by the overflow. */}
      <div ref={viewportRef} className="-mb-6 cursor-grab overflow-hidden pb-6 active:cursor-grabbing">
        <div className="-ml-6 flex items-start">
          {shots.map((shot, i) => (
            <div
              key={`${shot.url}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${shots.length}`}
              className={cn('min-w-0 shrink-0 grow-0 basis-full pl-6 transition-opacity duration-300', i !== index && 'opacity-40')}
            >
              <ShotFrame shot={shot} title={title} />
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-h-10 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Caption shot={active} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
            {pad(index + 1)} / {pad(shots.length)}
          </span>
          <button type="button" onClick={() => embla?.scrollPrev()} disabled={atStart} className={arrow} aria-label="Previous screenshot">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => embla?.scrollNext()} disabled={atEnd} className={arrow} aria-label="Next screenshot">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </figcaption>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Choose a screenshot">
        {shots.map((shot, i) => (
          <button
            key={`${shot.url}-thumb-${i}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={shot.label || `Screenshot ${i + 1}`}
            onClick={() => go(i)}
            className={cn(
              'relative w-24 shrink-0 overflow-hidden rounded-md border bg-muted transition-all sm:w-28',
              i === index ? 'border-foreground ring-1 ring-foreground' : 'border-border opacity-60 hover:opacity-100',
            )}
          >
            <img src={optimizeImage(shot.url, 240)} alt="" loading="lazy" draggable={false} className="block aspect-[2/1] w-full object-cover object-left-top" />
          </button>
        ))}
      </div>
    </figure>
  );
};
