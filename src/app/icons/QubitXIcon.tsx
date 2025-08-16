import React from 'react';

interface QubitXIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const QubitXIcon: React.FC<QubitXIconProps> = ({ 
  width = 24, 
  height = 24, 
  color = 'currentColor',
  className 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left bracket | */}
      <line 
        x1="5" 
        y1="8" 
        x2="5" 
        y2="92" 
        stroke={color} 
        strokeWidth="7" 
        strokeLinecap="round"
      />
      
      {/* X symbol */}
      <line 
        x1="27" 
        y1="25" 
        x2="57" 
        y2="75" 
        stroke={color} 
        strokeWidth="7" 
        strokeLinecap="round"
      />
      <line 
        x1="57" 
        y1="25" 
        x2="27" 
        y2="75" 
        stroke={color} 
        strokeWidth="7" 
        strokeLinecap="round"
      />
      
      {/* Right bracket ⟩ */}
      <path 
        d="M 75 10 L 95 50 L 75 90" 
        fill="none" 
        stroke={color} 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default QubitXIcon;