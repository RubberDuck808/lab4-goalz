import React from 'react';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import avatar from '../assets/UserAvatar_1.png';

// Static mock — will come from server
const MOCK_PLAYERS = [
  { id: 1, name: 'maximax',    status: 'Joined' },
  { id: 2, name: 'frankyfrank', status: 'Joined' },
  { id: 3, name: 'billyjoe',   status: 'Joined' },
];
const EXTRA_COUNT = 5;

export default function PartyOwnerPage({ onBack, onStart, onEnd }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Party" onBack={onBack} />

      <div className="flex flex-col px-6 gap-3">

        {/* Invite by email */}
        <div className="flex gap-3">
          <TextInput placeholder="Type email" className="flex-1 w-auto" />
          <GameButtons variant="task" size="half">
            Invite
          </GameButtons>
        </div>

        {/* Party code + copy */}
        <div className="flex gap-3 items-center">
          <TextInput placeholder="Type partycode" className="flex-1 w-auto" />
          <button className="flex items-center justify-center w-[44px] h-[44px] bg-[#DDF4FF] rounded-[9px] border-[2px] border-[#63C9F9] border-b-[4px] border-b-[#3aaedc] transition-all active:border-b-[2px] active:translate-y-[3px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1CB0F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>

        {/* Start */}
        <GameButtons variant="accept" onClick={onStart} className="w-full">
          Start
        </GameButtons>

        {/* Players in party */}
        <p className="font-custom-button font-bold text-[15px] text-zinc-700 uppercase tracking-wide mt-2 text-center">
          Players in party
        </p>

        <div className="flex flex-col gap-1">
          {MOCK_PLAYERS.map(({ id, name, status }) => (
            <div key={id} className="flex items-center gap-3 py-3 border-b border-zinc-100">
              <span className="text-zinc-400 font-custom-button font-bold w-4 text-sm">{id}</span>
              <img src={avatar} alt={name} className="w-[38px] h-[38px] rounded-full object-cover" />
              <span className="flex-1 font-custom-button font-bold text-[16px] text-zinc-800">{name}</span>
              <span className="font-custom-button text-[13px] text-[#1CB0F6] font-bold">{status}</span>
            </div>
          ))}

          {/* Extra count */}
          <div className="bg-zinc-100 rounded-[10px] py-3 text-center">
            <span className="font-custom-button text-[13px] text-zinc-400">+{EXTRA_COUNT}</span>
          </div>
        </div>

      </div>

      <div className="flex-1" />

      {/* End party */}
      <div className="flex justify-center pb-10">
        <GameButtons variant="decline" onClick={onEnd}>
          End Party
        </GameButtons>
      </div>

    </div>
  );
}
