import React from 'react';

export default function TextInput({ className = '', ...props }) {
  // Mapped exact user requested styles: 
  // display: flex; width: 325px; height: 42px; padding: 16px; flex-direction: column; align-items: flex-start; gap: 1px; border-radius: 8px; border: 2px solid #777; background: #D9D9D9; 
  
  // Note: Display flex on a standard <input> element relies on browser specifics, but we map all requested classes literally.
  const baseStyle = "input-text flex flex-col items-start gap-[1px] w-[325px] h-[42px] p-[16px] rounded-[8px] border-[2px] border-[#777] bg-[#D9D9D9] font-custom-button outline-none focus:border-[#555] placeholder:text-zinc-500 transition-colors";
  
  return (
    <input
      type="text"
      className={`${baseStyle} ${className}`}
      {...props}
    />
  );
}
