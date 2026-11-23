'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AdSlotWrapperProps {
  /** Fixed pixel height reserved for the ad slot to guarantee zero CLS */
  height?: number;
  /** Optional outer wrapper classes (margins, max-width, borders) */
  className?: string;
  /** Optional accessible label for the ad region */
  ariaLabel?: string;
  /** Optional muted text displayed in the loading skeleton */
  skeletonLabel?: string;
  children: React.ReactNode;
}

/**
 * AdSlotWrapper
 * Reserves a strictly fixed vertical footprint (`height === minHeight === maxHeight`)
 * with an instant loading skeleton placeholder before AdSense renders, keeping
 * Google Core Web Vitals Cumulative Layout Shift (CLS) at 0.
 */
export const AdSlotWrapper: React.FC<AdSlotWrapperProps> = ({
  height = 140,
  className = '',
  ariaLabel = 'Advertisement container',
  skeletonLabel = 'Advertisement',
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'filled' | 'unfilled'>('loading');

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof MutationObserver === 'undefined') return;

    const inspectAdStatus = () => {
      const ins = el.querySelector('ins.adsbygoogle');
      if (!ins) return;
      const adStatus = ins.getAttribute('data-ad-status');
      const hasIframe = Boolean(ins.querySelector('iframe'));
      if (adStatus === 'filled' || hasIframe) {
        setStatus('filled');
      } else if (adStatus === 'unfilled') {
        setStatus('unfilled');
      }
    };

    inspectAdStatus();

    const observer = new MutationObserver(() => {
      inspectAdStatus();
    });

    observer.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const fixedPx = `${height}px`;

  return (
    <div
      ref={wrapperRef}
      role="region"
      aria-label={ariaLabel}
      data-cls-locked="true"
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 ${className}`}
      style={{
        height: fixedPx,
        minHeight: fixedPx,
        maxHeight: fixedPx,
        contain: 'layout size',
      }}
    >
      {/* Loading Skeleton Layer (visible until AdSense fills the slot) */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-0 flex flex-col items-center justify-center gap-2.5 p-3 pointer-events-none transition-opacity duration-200 ${
          status === 'filled' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 select-none">
          {skeletonLabel}
        </span>
        <div
          className={`w-full max-w-2xl space-y-2 ${
            status === 'loading' ? 'animate-pulse' : 'opacity-60'
          }`}
        >
          <div className="h-3.5 w-3/4 mx-auto rounded bg-slate-200/80" />
          <div className="h-3 w-1/2 mx-auto rounded bg-slate-200/70" />
          {height >= 200 && (
            <div className="h-24 w-5/6 mx-auto rounded-lg bg-slate-200/60 mt-2" />
          )}
        </div>
      </div>

      {/* Actual AdSense Unit Layer */}
      <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdSlotWrapper;
