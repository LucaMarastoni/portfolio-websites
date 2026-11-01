import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import "./CardSwap.css";

export type CardSwapHandle = { next: () => void; prev: () => void };

type CardSwapProps = {
  children: ReactNode;
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  depth?: number;
  skewAmount?: number;
  visibleCards?: number;
  cardRadius?: number;
  delay?: number;
  speed?: number;
  bounce?: number;
  parallax?: number;
  hoverSpread?: number;
  dim?: number;
  autoplay?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  onChange?: (index: number) => void;
  className?: string;
  ariaLabel?: string;
};

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <article ref={ref} className={`card-swap-card ${className}`.trim()} {...props}>
      {children}
      <span className="card-swap-card-rim" aria-hidden="true" />
    </article>
  ),
);
Card.displayName = "Card";

const mod = (value: number, length: number) => ((value % length) + length) % length;

const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(
  (
    {
      children,
      width = 760,
      height = 500,
      cardDistance = 54,
      verticalDistance = 48,
      depth = 78,
      skewAmount = 3,
      visibleCards = 4,
      cardRadius = 24,
      delay = 4500,
      speed = 1,
      bounce = 0.35,
      parallax = 0.5,
      hoverSpread = 0.12,
      dim = 0.5,
      autoplay = true,
      pauseOnHover = true,
      draggable = true,
      onChange,
      className = "",
      ariaLabel = "Carosello progetti",
    },
    ref,
  ) => {
    const cards = Children.toArray(children);
    const count = cards.length;
    const rootRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);
    const transitionRef = useRef<number | null>(null);
    const pointerRef = useRef<{ id: number; x: number; y: number } | null>(null);
    const [active, setActive] = useState(0);
    const [leaving, setLeaving] = useState<number | null>(null);
    const [hovered, setHovered] = useState(false);
    const [inView, setInView] = useState(true);
    const [drag, setDrag] = useState({ x: 0, y: 0 });
    const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

    const select = useCallback(
      (index: number) => {
        if (!count) return;
        const nextIndex = mod(index, count);
        setLeaving(null);
        setDrag({ x: 0, y: 0 });
        setActive(nextIndex);
        onChange?.(nextIndex);
      },
      [count, onChange],
    );

    const next = useCallback(() => {
      if (count < 2 || leaving !== null) return;
      setLeaving(active);
      setDrag({ x: 0, y: 0 });
      transitionRef.current = window.setTimeout(() => {
        const nextIndex = mod(active + 1, count);
        setActive(nextIndex);
        setLeaving(null);
        onChange?.(nextIndex);
      }, Math.max(220, 360 / Math.max(0.2, speed)));
    }, [active, count, leaving, onChange, speed]);

    const prev = useCallback(() => {
      if (count < 2 || leaving !== null) return;
      select(active - 1);
    }, [active, count, leaving, select]);

    useImperativeHandle(ref, () => ({ next, prev }), [next, prev]);

    useEffect(() => {
      if (!autoplay || count < 2 || !inView || (pauseOnHover && hovered)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timerRef.current = window.setTimeout(next, Math.max(1200, delay));
      return () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      };
    }, [active, autoplay, count, delay, hovered, inView, next, pauseOnHover]);

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
      observer.observe(root);
      return () => observer.disconnect();
    }, []);

    useEffect(
      () => () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        if (transitionRef.current !== null) window.clearTimeout(transitionRef.current);
      },
      [],
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      const slot = (event.target as HTMLElement).closest<HTMLElement>("[data-swap-index]");
      if (!slot) return;
      const index = Number(slot.dataset.swapIndex);
      const position = mod(index - active, count);
      if (position > 0) {
        select(index);
        return;
      }
      if (!draggable || leaving !== null) return;
      pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.pointerType !== "touch") {
        setParallaxOffset({
          x: ((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5) * 24 * parallax,
          y: ((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5) * 18 * parallax,
        });
      }
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      setDrag({ x: event.clientX - pointer.x, y: event.clientY - pointer.y });
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      pointerRef.current = null;
      if (Math.hypot(drag.x, drag.y) > 70) next();
      else setDrag({ x: 0, y: 0 });
    };

    const rootStyle = {
      "--swap-w": `${width}px`,
      "--swap-h": `${height}px`,
      "--swap-radius": `${cardRadius}px`,
      "--swap-bounce": `${Math.min(1, Math.max(0, bounce))}`,
    } as CSSProperties;

    return (
      <div
        ref={rootRef}
        className={`card-swap ${className}`.trim()}
        style={rootStyle}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            next();
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            prev();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          pointerRef.current = null;
          setHovered(false);
          setDrag({ x: 0, y: 0 });
          setParallaxOffset({ x: 0, y: 0 });
        }}
      >
        <div className="card-swap-stage" style={{ transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)` }}>
          {cards.map((card, index) => {
            const position = mod(index - active, count);
            const visible = position < Math.min(visibleCards, count);
            const isLeaving = leaving === index;
            const spread = hovered ? 1 + hoverSpread : 1;
            const x = position * cardDistance * spread;
            const y = -position * verticalDistance * spread;
            const z = -position * depth;
            const shade = position === 0 ? 0 : dim * Math.min(0.72, position / visibleCards);
            const transform = isLeaving
              ? `translate3d(${drag.x}px, ${height * 1.18 + drag.y}px, 30px) rotate(${skewAmount * 2.5}deg)`
              : `translate3d(${x + (position === 0 ? drag.x : 0)}px, ${y + (position === 0 ? drag.y : 0)}px, ${z}px) skewY(${skewAmount}deg)`;

            return (
              <div
                key={index}
                className={`card-swap-slot${isLeaving ? " is-leaving" : ""}`}
                data-swap-index={index}
                data-front={position === 0 ? "" : undefined}
                aria-hidden={!visible}
                style={{
                  opacity: visible ? 1 : 0,
                  visibility: visible ? "visible" : "hidden",
                  zIndex: isLeaving ? count + 2 : count - position,
                  transform,
                }}
              >
                {card}
                <span className="card-swap-shade" style={{ opacity: shade }} aria-hidden="true" />
              </div>
            );
          })}
        </div>
        <p className="card-swap-status" aria-live="polite">Progetto {active + 1} di {count}</p>
      </div>
    );
  },
);
CardSwap.displayName = "CardSwap";

export default CardSwap;
