import React from 'react';

/**
 * A highly reusable button component using exact CSS specifications.
 */
export default function GameButtons({ children, onClick, className = '', variant = 'task', size = 'default', ...props }) {
  // Support for the default 328px width, and a 'half' 156px width so two buttons fit side-by-side perfectly with a 16px gap
  const sizes = {
    default: "w-[328px] h-[48px] rounded-[13px] pt-0 pr-[0.5px] pb-[4px] pl-[0.5px]",
    half:    "w-[156px] h-[48px] rounded-[13px] pt-0 pr-[0.5px] pb-[4px] pl-[0.5px]",
    square:  "w-[328px] h-[280px] rounded-[20px]",
  };

  const baseStyle = `font-custom-button flex items-center justify-center ${sizes[size] || sizes.default} font-bold transition-all tracking-wide uppercase text-white`;

  // Custom variants for specific game actions utilizing the 3D push-button shadow effect
  const variants = {
    task:   "bg-[#1CB0F6] border-b-[4px] border-[#1899D6] active:border-b-[0px] active:translate-y-[4px]",
    accept: "bg-[#58CC02] border-b-[4px] border-[#5DA700] active:border-b-[0px] active:translate-y-[4px]",
    decline:"bg-[#FF4B4B] border-b-[4px] border-[#90461F] active:border-b-[0px] active:translate-y-[4px]",
    party:  "bg-[#FFC107] border-b-[4px] border-[#CC8F00] active:border-b-[0px] active:translate-y-[4px]",
  };

  return (
    <button
      onClick={onClick}
      className={`game-btn-text ${baseStyle} ${variants[variant] || variants.task} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
