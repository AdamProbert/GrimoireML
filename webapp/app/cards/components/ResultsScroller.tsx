'use client';
import React from 'react';

interface ResultsScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  show?: boolean;
}

/**
 * Reusable scroll container applying consistent styling + custom scrollbar for card grids.
 */
export const ResultsScroller: React.FC<ResultsScrollerProps> = ({
  scrollRef,
  show = true,
  className = '',
  children,
  ...rest
}) => {
  if (!show) return null;
  return (
    <div
      // cast because Mantine/React types expect possibly non-null; lifecycle handles null fine
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className={[
        'grim-grid-wrapper flex-1 min-h-0 relative border border-white/15 rounded-md',
        'bg-black/50 backdrop-blur-sm mx-auto w-full overflow-y-auto p-3',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
      <style jsx>{`
        .grim-grid-wrapper {
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .grim-grid-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .grim-grid-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default ResultsScroller;
