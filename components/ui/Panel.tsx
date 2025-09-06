import React from 'react';
import Heading from '../Heading';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
  headingLevel?: 1|2|3|4|5|6;
  actions?: React.ReactNode;
  padded?: boolean;
  scroll?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  heading,
  headingLevel = 3,
  actions,
  padded = true,
  scroll = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div className={`panel flex flex-col ${padded ? 'p-4' : ''} ${scroll ? 'overflow-y-auto scroll-y' : ''} ${className}`} {...rest}>
      {(heading || actions) && (
        <div className="flex items-start justify-between gap-2 mb-3">
          {heading && (
            typeof heading === 'string' ? <Heading level={headingLevel} className="text-sm tracking-wide">{heading}</Heading> : heading
          )}
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Panel;
