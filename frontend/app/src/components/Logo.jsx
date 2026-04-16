import React from 'react';

/**
 * A top-level logo banner component that renders the composite image asset.
 */
export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center justify-center w-[430px] h-[79px] space-x-3 ${className}`}>
      <img
        src="/src/assets/icons/logo.svg"
        alt="Loggy Mascot"
        className="h-[55px] w-[55px] object-contain"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <span className="logo-text text-[40px] font-bold font-custom-button pb-1 text-[#C07F58]">
        loggin
      </span>
    </div>
  );
}
