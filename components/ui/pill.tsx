import type { ComponentProps } from 'react';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

export type PillProps = ComponentProps<typeof Badge> & {
  themed?: boolean;
};

export const Pill = ({
  variant = 'secondary',
  themed = false,
  className,
  ...props
}: PillProps) => (
  <Badge
    className={cn('gap-2 rounded-full px-3 py-1.5 font-normal', className)}
    variant={variant}
    {...props}
  />
);

