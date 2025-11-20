"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'minimal' | 'fullscreen';
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className,
  text = 'Loading...',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const logoSize = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 72
  };

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
            <div className="relative rounded-full bg-background/90 p-4 shadow-2xl border border-primary/10">
              <Image
                src="/curenium-no-bg.png"
                alt="Curenium"
                width={logoSize[size]}
                height={logoSize[size]}
                className="animate-spin"
                style={{ animationDuration: '2s' }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {text}
            </p>
            <div className="mt-2 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Image
          src="/curenium-no-bg.png"
          alt="Loading"
          width={logoSize[size]}
          height={logoSize[size]}
          className="animate-spin opacity-60"
          style={{ animationDuration: '1.5s' }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3 p-6", className)}>
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 animate-spin opacity-75 blur-sm" style={{ animationDuration: '3s' }} />

        {/* Inner rotating border */}
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1s' }} />

        {/* Logo container */}
        <div className="relative rounded-full bg-gradient-to-br from-background to-background/80 p-3 shadow-xl border border-primary/10 backdrop-blur-sm">
          <Image
            src="/curenium-no-bg.png"
            alt="Curenium"
            width={logoSize[size]}
            height={logoSize[size]}
            className="animate-pulse"
          />
        </div>
      </div>

      {text && (
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {text}
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Convenience components for common use cases
export const PageLoader = () => (
  <Loader variant="fullscreen" text="Loading Curenium..." />
);

export const InlineLoader = ({ text }: { text?: string }) => (
  <Loader variant="minimal" text={text} />
);

export const CardLoader = ({ text }: { text?: string }) => (
  <Loader size="md" text={text} className="min-h-[200px]" />
);