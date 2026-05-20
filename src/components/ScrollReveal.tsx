'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/helpers';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: '0' | '100' | '200' | '300' | '400' | '500';
  once?: boolean;
}

export const ScrollReveal = ({ 
  children, 
  className, 
  delay = '0', 
  once = true 
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [once]);

  const delayClass = delay !== '0' ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={cn(
        'animate-on-scroll',
        delayClass,
        isVisible && 'visible',
        className
      )}
    >
      {children}
    </div>
  );
};
