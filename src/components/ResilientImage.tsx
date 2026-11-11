import { useState } from 'react';
import { Stethoscope } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'Obraz medyczny',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 text-slate-600 p-6 text-center ${className}`}
      >
        <Stethoscope className="w-8 h-8 text-sky-700 mb-2 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-600">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
