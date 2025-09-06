'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface CardThumbProps {
  name: string;
  imageUrl?: string | null;
  count?: number;
  status?: 'pending' | 'ok' | 'error';
  compact?: boolean;
  highlight?: boolean | 'new' | 'changed';
  onClick?: () => void;
  previewOnHover?: boolean; // show enlarged floating preview on hover (default true)
}

export const CardThumb: React.FC<CardThumbProps> = ({
  name,
  imageUrl,
  count,
  status = 'pending',
  compact = false,
  highlight,
  onClick,
  previewOnHover = true,
}) => {
  const highlightRing = highlight
    ? 'ring-2 ring-[color:var(--color-accent-primary)] shadow-ember'
    : '';
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const [previewEntered, setPreviewEntered] = useState(false);
  const previewDelay = 100; // ms

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleEnter = () => {
    if (!previewOnHover || !imageUrl) return;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const desiredWidth = 340; // enlarged preview width
      const desiredHeight = 480; // approximate height for positioning
      // Center enlarged preview over the thumbnail so it "grows" from it
      let left = rect.left + rect.width / 2 - desiredWidth / 2;
      let top = rect.top + rect.height / 2 - desiredHeight / 2;
      // Constrain within viewport with small margin
      const margin = 8;
      if (left < margin) left = margin;
      if (left + desiredWidth > window.innerWidth - margin)
        left = window.innerWidth - margin - desiredWidth;
      if (top < margin) top = margin;
      if (top + desiredHeight > window.innerHeight - margin)
        top = window.innerHeight - margin - desiredHeight;
      setPreviewPos({ top, left });
      setShowPreview(true);
    }, previewDelay);
  };

  const handleLeave = () => {
    clearTimer();
    setShowPreview(false);
  };

  useEffect(() => () => clearTimer(), []);
  // Trigger scale/opacity transition one frame after mounting preview
  useEffect(() => {
    if (showPreview) {
      requestAnimationFrame(() => setPreviewEntered(true));
    } else {
      setPreviewEntered(false);
    }
  }, [showPreview]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={`relative group rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]/80 overflow-hidden ${compact ? 'h-40' : ''} ${onClick ? 'cursor-pointer glow-primary-hover' : 'glow-primary-hover'} ${highlightRing}`}
        onClick={onClick}
        aria-label={name}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-auto block" loading="lazy" />
        ) : (
          <div className="flex items-center justify-center h-48 text-[10px] text-[color:var(--color-text-subtle)]">
            {status === 'error' ? 'Error' : 'Loading...'}
          </div>
        )}
        {typeof count === 'number' && (
          <div className="absolute top-1 left-1 rounded bg-[color:var(--color-bg-base)]/70 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-accent-warm)]">
            {count}×
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-[color:var(--color-bg-base)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-[10px] line-clamp-2 tracking-wide">
          {name}
        </div>
        {highlight && (
          <span className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-ember via-gold to-ember" />
        )}
      </div>
      {typeof window !== 'undefined' &&
        showPreview &&
        imageUrl &&
        previewPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[200] w-[340px] select-none"
            style={{ top: previewPos.top, left: previewPos.left }}
          >
            <div
              className={`relative ring-2 ring-[color:var(--color-accent-primary)] shadow-ember rounded-md overflow-hidden bg-[color:var(--color-bg-elevated)] transition duration-150 ease-out transform origin-center ${previewEntered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.75]'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-auto block"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,140,0,0.5))' }}
              />
              <div className="absolute inset-x-0 bottom-0 p-2 text-[11px] font-medium bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                {name}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CardThumb;
