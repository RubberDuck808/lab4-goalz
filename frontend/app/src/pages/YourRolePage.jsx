import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';

// singlePlayer: true  → user plays both Scout + Trailblazer
// singlePlayer: false → user receives one role from the server (party mode)
export default function YourRolePage({ onBack, singlePlayer = false }) {
  const [revealed, setRevealed] = useState(false);

  const roles = singlePlayer ? ['Scout', 'Trailblazer'] : ['Scout'];

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Your Role" onBack={onBack} />

      <div className="flex flex-col items-center flex-1 justify-center gap-6 -mt-16">

        {/* Card(s) — single player shows two side by side */}
        <div className={`flex ${singlePlayer ? 'flex-row gap-4' : 'flex-col'} items-center`}>
          {roles.map((role) => (
            <FlipCard key={role} role={role} revealed={revealed} onTap={() => setRevealed(r => !r)} />
          ))}
        </div>

        {/* Tap label */}
        <p className="font-custom-button font-bold text-[22px] text-zinc-700 uppercase tracking-wide text-center leading-tight">
          {revealed ? 'Your roles!' : 'Tap to\nview role'}
        </p>

      </div>

    </div>
  );
}

function FlipCard({ role, revealed, onTap }) {
  const cardW = 150;
  const cardH = 210;

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onTap}
    >
      <div
        style={{
          width: cardW,
          height: cardH,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease',
          transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 bg-white rounded-[20px] border border-zinc-200 shadow-md flex items-center justify-center"
        >
          <div className="w-[110px] h-[160px] bg-zinc-200 rounded-[14px] flex items-center justify-center">
            <span className="text-white font-bold text-[48px] leading-none">?</span>
          </div>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 bg-white rounded-[20px] border border-zinc-200 shadow-md flex items-center justify-center"
        >
          <div className="w-[110px] h-[160px] bg-[#DDF4FF] rounded-[14px] flex flex-col items-center justify-center gap-1 border-2 border-[#63C9F9]">
            <span className="font-custom-button font-bold text-[22px] text-[#1CB0F6] uppercase tracking-wide text-center leading-tight">
              {role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
