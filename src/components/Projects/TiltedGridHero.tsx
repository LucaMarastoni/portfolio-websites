import * as React from "react";
import { cn } from "@/lib/utils";
import "./TiltedGridHero.css";

const SLICES = 16;
const CAMERA = 1.6;
const MAX_WIDTH = 66;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const tileHeight = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  );
  const radius = width * arc(bend);
  if (!(tileHeight > 0) || !(radius > 0)) {
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  }

  const degrees = (radians: number) => (radians * 180) / Math.PI;
  const unit = degrees(tileHeight / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = degrees(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (number: number) => +number.toFixed(4);
  const sweep = round((columns * pitch) / 2);

  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
};

export type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tileClass = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;
  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(null);
  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((previous) =>
        previous?.columns === next.columns &&
        previous.sweep === next.sweep &&
        previous.unit === next.unit
          ? previous
          : next,
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [aspectRatio, bend, gap, tileHeight]);

  React.useEffect(() => {
    for (const { src } of images) new Image().src = src;
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend);
  const unitSize = (number: number) =>
    `calc(${+number.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / aspectRatio
    ).toFixed(4)}cqw))`;
  const radiusValue = 100 * arc(bend);
  const radius = `${+radiusValue.toFixed(3)}cqw`;
  const turn = (degrees: number) =>
    `translateZ(${radius}) rotateY(${+degrees.toFixed(4)}deg) translateZ(-${radius})`;
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const animationStyles =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tileClass}{animation-play-state:paused}}`;
  const sliceShare = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg, transparent, #000 ${fade}%, #000 ${
    100 - fade
  }%, transparent)`;

  return (
    <div
      ref={ref}
      className={cn("tilted-grid-hero", className)}
      {...props}
      style={{ containerType: "size", ...props.style }}
    >
      <style>{animationStyles}</style>

      <div
        aria-hidden="true"
        className="tilted-grid-hero__band"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(radiusValue * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, tileIndex) => {
          const firstImageIndex = columns - 1 - tileIndex;
          const image = images[(shown[tileIndex] ?? firstImageIndex) % Math.max(images.length, 1)];

          return (
            <div
              key={tileIndex}
              className={cn(tileClass, "tilted-grid-hero__tile")}
              style={{
                left: `calc(50% - ${unitSize(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${unitSize(0.5)})`,
                width: unitSize(aspectRatio),
                height: unitSize(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-tileIndex * speed}s infinite`,
              }}
              onAnimationIteration={(event) => {
                const lap = Math.round(event.elapsedTime / duration);
                setShown((previous) => {
                  const next = lap * columns + firstImageIndex;
                  return previous[tileIndex] === next
                    ? previous
                    : { ...previous, [tileIndex]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, sliceIndex) => (
                <div
                  key={sliceIndex}
                  className={cn(
                    "tilted-grid-hero__slice",
                    sliceIndex === 0 && "is-first",
                    sliceIndex === SLICES - 1 && "is-last",
                  )}
                  style={{
                    left: unitSize((aspectRatio - sliceShare) / 2),
                    width:
                      sliceIndex === SLICES - 1
                        ? unitSize(sliceShare)
                        : `calc(${unitSize(sliceShare)} + 1px)`,
                    height: unitSize(1),
                    transform: turn(
                      (aspectRatio / 2 - (sliceIndex + 0.5) * sliceShare) * unit,
                    ),
                  }}
                >
                  {image ? (
                    <img
                      src={image.src}
                      alt={sliceIndex === 0 ? (image.alt ?? "") : ""}
                      draggable={false}
                      className="tilted-grid-hero__image"
                      style={{
                        left: unitSize(-sliceIndex * sliceShare),
                        width: unitSize(aspectRatio),
                        height: unitSize(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
