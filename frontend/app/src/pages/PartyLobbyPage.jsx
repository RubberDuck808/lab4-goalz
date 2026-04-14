import React from 'react';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import avatar from '../assets/UserAvatar_1.png';

const STATUS_STYLES = {
  Creator: 'text-[#58CC02] font-bold',
  Joined:  'text-[#1CB0F6] font-bold',
  Invited: 'text-[#FFC107] font-bold',
};

// Static mock — will come from server
const MOCK_PLAYERS = [
  { id: 1, name: 'maximax', status: 'Creator' },
  { id: 2, name: 'User',    status: 'Joined'  },
  { id: 3, name: 'User',    status: 'Joined'  },
  { id: 4, name: 'User',    status: 'Joined'  },
  { id: 5, name: 'User',    status: 'Invited' },
];

export default function PartyLobbyPage({ onBack, onLeave }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Party" onBack={onBack} />

      {/* Player list */}
      <div className="flex flex-col px-6 gap-1">
        {MOCK_PLAYERS.map(({ id, name, status }) => (
          <div key={id} className="flex items-center gap-3 py-3 border-b border-zinc-100">
            <span className="text-zinc-400 font-custom-button font-bold w-4 text-sm">{id}</span>
            <img src={avatar} alt={name} className="w-[38px] h-[38px] rounded-full object-cover" />
            <span className="flex-1 font-custom-button font-bold text-[16px] text-zinc-800">{name}</span>
            <span className={`font-custom-button text-[13px] ${STATUS_STYLES[status]}`}>{status}</span>
          </div>
        ))}

        {/* Waiting footer */}
        <div className="bg-zinc-100 rounded-[10px] py-3 text-center mt-2">
          <span className="font-custom-button text-[13px] text-zinc-400">waiting for players ...</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Leave button */}
      <div className="flex justify-center pb-10">
        <GameButtons variant="decline" onClick={onLeave}>
          Leave Party
        </GameButtons>
      </div>

    </div>
  );
}
