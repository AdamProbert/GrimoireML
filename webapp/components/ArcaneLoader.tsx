'use client';
import React from 'react';
import Image from 'next/image';
import bookIcon from '../assets/book-icon.png';

interface ArcaneLoaderProps {
  label?: string;
  fullscreen?: boolean;
  showIcon?: boolean;
}

/**
 * ArcaneLoader shows a magical concentric ring animation with an orbiting spark.
 * Defaults to fullscreen overlay; can be embedded by setting fullscreen={false}.
 */
export default function ArcaneLoader({
  label = 'Conjuring results…',
  fullscreen = true,
  showIcon = true,
}: ArcaneLoaderProps) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      className={[
        fullscreen
          ? 'fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm'
          : 'relative grid place-items-center py-10',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
  return (
    <Wrapper>
      <div className="flex flex-col items-center">
        <div className="relative animate-breathe" style={{ width: 140, height: 140 }}>
          <svg
            width={140}
            height={140}
            viewBox="0 0 140 140"
            className="[filter:drop-shadow(0_0_10px_rgba(200,170,255,0.25))]"
          >
            <defs>
              <radialGradient id="aglGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8f5ff" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#b79dff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#815dff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="aglStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d8c4ff" />
                <stop offset="40%" stopColor="#c3a9ff" />
                <stop offset="70%" stopColor="#a17bff" />
                <stop offset="100%" stopColor="#d4b8ff" />
              </linearGradient>
              <filter id="aglBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="0 0 0 0 0.85  0 0 0 0 0.75  0 0 0 0 1  0 0 0 0.55 0"
                />
              </filter>
            </defs>
            {/* Soft inner glow */}
            <circle cx="70" cy="70" r="46" fill="url(#aglGlow)" />
            {/* Base outer ring (slow spin) */}
            <circle
              cx="70"
              cy="70"
              r="60"
              className="animate-spin-a"
              stroke="url(#aglStroke)"
              strokeOpacity="0.55"
              strokeWidth="2"
              fill="none"
            />
            {/* Overlay faint ring (reverse + subtle dash shift) */}
            <circle
              cx="70"
              cy="70"
              r="60"
              className="animate-spin-b animate-dash-shift"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="2"
              strokeDasharray="4 10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Inner dashed rune orbit (reverse) */}
            <circle
              cx="70"
              cy="70"
              r="44"
              stroke="currentColor"
              strokeDasharray="14 10 4 8"
              strokeDashoffset="6"
              strokeWidth="2"
              className="animate-spin-b"
              strokeLinecap="round"
              fill="none"
              opacity={0.9}
            />
            {/* Secondary micro dash ring (faster) */}
            <circle
              cx="70"
              cy="70"
              r="37"
              stroke="currentColor"
              strokeDasharray="2 12"
              strokeWidth="1.5"
              className="animate-spin-a animate-dash-shift-fast"
              strokeLinecap="round"
              fill="none"
              opacity={0.55}
            />
            {/* Orbiting sparks */}
            <g className="animate-orbit-fast" style={{ transformOrigin: '70px 70px' }}>
              <circle cx="70" cy="14" r="3.3" fill="#e4d5ff" filter="url(#aglBlur)" />
              <circle cx="70" cy="14" r="1.4" fill="#fff" />
            </g>
            <g className="animate-orbit-slow" style={{ transformOrigin: '70px 70px' }}>
              <circle cx="70" cy="126" r="2.4" fill="#c7b4ff" opacity={0.85} />
            </g>
            {/* Center glyph (fallback) */}
            {!showIcon && (
              <text
                x="50%"
                y="54%"
                textAnchor="middle"
                fontSize="20"
                fill="currentColor"
                opacity="0.9"
                className="animate-glyph-flicker"
              >
                ✦
              </text>
            )}
          </svg>
          {showIcon && (
            <Image
              src={bookIcon}
              alt="Grimoire icon"
              /* Increase from 64px (w-16) to 112px (w-28) which fits inside 140px canvas without colliding badly with outer ring */
              className="absolute inset-0 m-auto w-28 h-28 select-none"
              priority
            />
          )}
        </div>
        <div className="mt-4 text-center text-sm text-white/90 px-4 max-w-[220px] leading-snug">
          {label}
        </div>
      </div>
      <style jsx>{`
        svg {
          color: #c7b4ff;
        }
        .animate-spin-a {
          animation: spinA 7.2s cubic-bezier(0.65, 0.02, 0.32, 0.99) infinite;
        }
        .animate-spin-b {
          animation: spinB 9.5s cubic-bezier(0.7, 0.05, 0.25, 1) infinite reverse;
        }
        .animate-dash-shift {
          animation: dashShift 4.8s linear infinite;
        }
        .animate-dash-shift-fast {
          animation: dashShift 2.4s linear infinite;
        }
        .animate-orbit-fast {
          animation: orbitFast 2.4s linear infinite;
        }
        .animate-orbit-slow {
          animation: orbitSlow 5.6s linear infinite;
        }
        .animate-breathe {
          animation: breathe 3.8s ease-in-out infinite;
        }
        .animate-glyph-flicker {
          animation: glyph 5s steps(60, end) infinite;
        }
        @keyframes spinA {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spinB {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes dashShift {
          to {
            stroke-dashoffset: -140;
          }
        }
        @keyframes orbitFast {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbitSlow {
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes breathe {
          0%,
          100% {
            transform: scale(0.965);
            filter: drop-shadow(0 0 6px rgba(188, 160, 255, 0.3));
          }
          50% {
            transform: scale(1);
            filter: drop-shadow(0 0 14px rgba(220, 200, 255, 0.55));
          }
        }
        @keyframes glyph {
          0%,
          96%,
          100% {
            opacity: 1;
          }
          97% {
            opacity: 0.55;
          }
          98% {
            opacity: 0.2;
          }
          99% {
            opacity: 0.85;
          }
        }
      `}</style>
    </Wrapper>
  );
}
