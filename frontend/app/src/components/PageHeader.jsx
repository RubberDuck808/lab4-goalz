import React from 'react';
import lessThanIcon from '../assets/lessthan.svg';

export default function PageHeader({ title = '', onBack }) {
  return (
    <div className="w-full h-[82px] flex items-center px-6 relative shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-6 active:translate-y-[2px] transition-transform"
        >
          <img src={lessThanIcon} alt="Back" className="h-[22px]" />
        </button>
      )}
      <h2 className="w-full text-center font-custom-button font-bold text-[24px] text-zinc-700 uppercase">
        {title}
      </h2>
    </div>
  );
}
