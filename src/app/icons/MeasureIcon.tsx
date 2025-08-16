import React from 'react';

interface MeasureIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const MeasureIcon: React.FC<MeasureIconProps> = ({ 
  width = 24, 
  height = 24, 
  strokeColor = 'currentColor',
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
      {/* Semi-circle */}
      <path 
        d="M 20 70 A 30 30 0 0 1 80 70" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      
      {/* Needle */}
      <line 
        x1="50" 
        y1="70" 
        x2="72" 
        y2="35" 
        stroke={strokeColor} 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Center dot */}
      <circle 
        cx="50" 
        cy="70" 
        r="2" 
        fill={strokeColor}
      />
    </svg>
  );
};

export default MeasureIcon;