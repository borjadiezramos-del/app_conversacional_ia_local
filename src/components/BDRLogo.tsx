import React from 'react';

interface BDRLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'mark';
}

export const BDRLogo: React.FC<BDRLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeClasses = {
    sm: 'h-7 w-auto',
    md: 'h-9 w-auto',
    lg: 'h-12 w-auto',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG recreating the BDR brand symbol with layered stylized blue geometry */}
      <svg
        className={sizeClasses}
        viewBox="0 0 160 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1: Subtle translucent light-blue soft accent */}
        <path
          d="M12 18C12 11.3726 17.3726 6 24 6H136C142.627 6 148 11.3726 148 18V62C148 68.6274 142.627 74 136 74H24C17.3726 74 12 68.6274 12 62V18Z"
          fill="#3da0c2"
          fillOpacity="0.45"
          transform="rotate(-1.5 80 40)"
        />
        {/* Layer 2: Main primary solid BDR blue block */}
        <rect
          x="16"
          y="12"
          width="128"
          height="56"
          rx="8"
          fill="#2a7b9b"
        />
        {/* White BDR bold geometric typography */}
        <g fill="#FFFFFF">
          {/* B */}
          <path
            d="M32 23H48.5C53.2 23 56.5 25.8 56.5 30C56.5 32.8 54.8 34.8 52.2 35.8C55.6 36.8 57.5 39.2 57.5 42.8C57.5 47.5 53.8 50.5 48.5 50.5H32V23ZM44.2 33.2C45.8 33.2 47 32.2 47 30.6C47 29.1 45.8 28.1 44.2 28.1H39.8V33.2H44.2ZM44.7 45.4C46.6 45.4 48 44.3 48 42.5C48 40.8 46.6 39.7 44.7 39.7H39.8V45.4H44.7Z"
          />
          {/* D */}
          <path
            d="M63 23H78C87 23 93.5 28.5 93.5 36.8C93.5 45 87 50.5 78 50.5H63V23ZM77.2 45C82.2 45 85.5 41.5 85.5 36.8C85.5 32 82.2 28.5 77.2 28.5H70.8V45H77.2Z"
          />
          {/* R */}
          <path
            d="M99 23H114.5C120.2 23 124 26.5 124 31.5C124 35.2 121.2 38.2 117 39.2L125 50.5H116.5L109.5 40.5H106.8V50.5H99V23ZM113.5 35.2C115.5 35.2 116.8 34 116.8 32.2C116.8 30.5 115.5 29.3 113.5 29.3H106.8V35.2H113.5Z"
          />
        </g>
      </svg>
    </div>
  );
};
