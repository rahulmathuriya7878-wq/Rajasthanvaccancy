import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export interface AdSectionProps {
  /** AdSense Slot ID */
  slot?: string;
  /** AdSense Client ID (defaults to VITE_ADSENSE_CLIENT_ID or placeholder) */
  client?: string;
  /** Responsive ad format */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  /** Custom wrapper styling */
  className?: string;
  /** Optional label shown above ad (e.g., 'Advertisement' / 'विज्ञापन') */
  label?: string;
  /** Minimum height to prevent layout shifts (CLS) */
  minHeight?: string | number;
  /** Enable full width responsive behavior */
  responsive?: boolean;
}

/**
 * Reusable AdSection Component
 * Safely waits for container width > 0 before pushing to adsbygoogle
 * to prevent "TagError: adsbygoogle.push() error: No slot size for availableWidth=0".
 */
export const AdSection: React.FC<AdSectionProps> = ({
  slot = '3785509362',
  client = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-8302542447035711',
  format = 'auto',
  className = '',
  label = 'विज्ञापन (Advertisement)',
  minHeight = '90px',
  responsive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Inject AdSense script into document head only if no adsbygoogle script exists yet
    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );

    if (!existingScript && client && client !== 'ca-pub-0000000000000000') {
      const scriptTag = document.createElement('script');
      scriptTag.id = 'google-adsense-script';
      scriptTag.async = true;
      scriptTag.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      scriptTag.crossOrigin = 'anonymous';
      document.head.appendChild(scriptTag);
    }

    // 2. Helper to safely push ad only when container has non-zero availableWidth
    const tryPushAd = (): boolean => {
      if (isPushed.current || !adRef.current || !containerRef.current) {
        return false;
      }

      // Skip if AdSense already processed this <ins> element
      const status = adRef.current.getAttribute('data-adsbygoogle-status');
      const adStatus = adRef.current.getAttribute('data-ad-status');
      if (status || adStatus) {
        isPushed.current = true;
        return true;
      }

      const width = containerRef.current.offsetWidth || adRef.current.offsetWidth;
      if (width <= 0) {
        return false;
      }

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isPushed.current = true;
        return true;
      } catch (err) {
        // Silence TagError if slot was already initialized or width transiently changed
        isPushed.current = true;
        return true;
      }
    };

    // Attempt push on next animation frame after layout pass
    let rafId = window.requestAnimationFrame(() => {
      if (!tryPushAd() && typeof ResizeObserver !== 'undefined' && containerRef.current) {
        const observer = new ResizeObserver(() => {
          if (tryPushAd()) {
            observer.disconnect();
          }
        });
        observer.observe(containerRef.current);
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [client, slot]);

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-[250px] my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 text-center transition-all shadow-2xs ${className}`}
      style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
    >
      {label && (
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1 select-none">
          {label}
        </div>
      )}

      <div className="block w-full min-h-[90px] overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            minWidth: '250px',
            minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};

export default AdSection;
