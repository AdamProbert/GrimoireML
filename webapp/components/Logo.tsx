import Image from 'next/image';
import logoImg from '../assets/gimoire-ml-logo-1000x1000.png';
import React from 'react';

interface LogoProps {
  size?: number; // pixel size (square)
  className?: string;
  priority?: boolean;
}

export default function Logo({ size = 44, className = '', priority }: LogoProps) {
  return (
    <Image
      src={logoImg}
      alt="GrimoireML logo"
      width={size}
      height={size}
      priority={priority}
      className={['inline-block select-none', 'rounded-md shadow-sm', className]
        .join(' ')
        .trim()}
    />
  );
}
