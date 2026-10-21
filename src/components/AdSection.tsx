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
 * Dynamically injects Google AdSense script into document head if needed
 * and renders a safe, layout-friendly responsive ad unit container.
 */
export const AdSection: React.FC<AdSectionProps> = ({
  slot = '1234567890',
  client = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000',
  format = 'auto',
  className = '',
  label = 'Advertisement',
  minHeight = '90px',
  responsive = true,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Inject AdSense script into document head if not present
    const scriptId = 'google-adsense-script';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptTag && client && client !== 'ca-pub-0000000000000000') {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.async = true;
      scriptTag.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      scriptTag.crossOrigin = 'anonymous';
      document.head.appendChild(scriptTag);
    }

    // 2. Safe push to adsbygoogle array
    try {
      if (adRef.current && !isPushed.current) {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isPushed.current = true;
      }
    } catch (err) {
      console.warn('AdSense push handled:', err);
    }
  }, [client]);

  return (
    <div
      className={`w-full my-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/60 p-2 sm:p-3 transition-all ${className}`}
      style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
    >
      {label && (
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1 select-none">
          {label}
        </div>
      )}

      <div className="flex items-center justify-center w-full overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
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
