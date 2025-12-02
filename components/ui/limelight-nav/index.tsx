'use client';

import React, { useState, useRef, useLayoutEffect, useEffect, cloneElement } from 'react';
import { cn } from '../../../lib/utils';

export type NavItem = {
  id: string | number;
  icon: React.ReactElement;
  label?: string;
  onClick?: () => void;
};

export type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

/**
 * An adaptive-width navigation bar with a "limelight" effect that highlights the active item.
 */
export const LimelightNav = ({
  items = [],
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);
  const [limelightStyle, setLimelightStyle] = useState<{ left: number; width: number }>({ left: -999, width: 0 });

  // Update activeIndex when defaultActiveIndex changes externally
  useEffect(() => {
    setActiveIndex(defaultActiveIndex);
  }, [defaultActiveIndex]);

  useLayoutEffect(() => {
    if (items.length === 0) return;

    const activeItem = navItemRefs.current[activeIndex];
    if (activeItem) {
      const left = activeItem.offsetLeft - 6;
      const width = activeItem.offsetWidth + 12;
      setLimelightStyle({ left, width });

      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) {
    return null; 
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setActiveIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav className={cn('relative inline-flex items-center h-14 rounded-full px-2', className)}>
      {items.map(({ id, icon, label, onClick }, index) => (
          <button
            key={id}
            ref={el => { navItemRefs.current[index] = el; }}
            className={cn('relative z-20 flex h-full cursor-pointer items-center justify-center focus:outline-none', iconContainerClassName)}
            onClick={() => handleItemClick(index, onClick)}
            aria-label={label}
            type="button"
          >
            {cloneElement(icon as React.ReactElement<any>, {
              className: cn(
                'w-5 h-5 transition-colors duration-200',
                activeIndex === index ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
                (icon.props as any)?.className || '',
                iconClassName || ''
              ),
            })}
          </button>
      ))}

      <div 
        ref={limelightRef}
        className={cn(
          'absolute inset-y-1 z-10 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] shadow-sm',
          isReady ? 'transition-all duration-300 ease-in-out' : '',
          limelightClassName
        )}
        style={{ left: limelightStyle.left, width: limelightStyle.width }}
      />
    </nav>
  );
};
