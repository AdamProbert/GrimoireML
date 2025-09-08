import Image from 'next/image';
import React from 'react';
import bookIcon from '../assets/book-icon.png';

interface HeroProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
  hideDefaultHeader?: boolean;
}

/**
 * Hero: lightweight wrapper to vertically center primary content (card search) while
 * keeping a consistent max width and responsive spacing. Sticky header handled in layout.
 */
export function Hero({ children, title, subtitle, hideDefaultHeader }: HeroProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center justify-start md:justify-center flex-1 w-full max-w-5xl mx-auto min-h-[calc(100vh-90px)] pt-8 md:pt-0">
        {!hideDefaultHeader && (
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Image
              src={bookIcon}
              alt="Grimoire icon"
              className="w-12 h-12 drop-shadow-[0_0_6px_rgba(255,160,0,0.35)]"
              priority
            />
            {title && (
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
          </div>
        )}
        {subtitle && (
          <div className="text-sm text-white/70 mb-4 text-center max-w-xl">{subtitle}</div>
        )}
        {children}
      </div>
    </div>
  );
}

export default Hero;
