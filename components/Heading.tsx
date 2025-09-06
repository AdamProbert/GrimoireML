import React from 'react';

/**
 * Reusable heading component to enforce consistent gradient styling across the app.
 * Usage: <Heading level={3}>Section</Heading>
 */
type Level = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & { level?: Level };

export function Heading({ level = 3, children, className = '', ...rest }: HeadingProps) {
  const Tag = `h${level}` as keyof Pick<
    JSX.IntrinsicElements,
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  >;
  const base = 'font-semibold text-gradient-brand';
  return (
    <Tag className={base + (className ? ' ' + className : '')} {...rest}>
      {children}
    </Tag>
  );
}

export default Heading;
