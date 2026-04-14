import React from 'react';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';

export default function RouteModePage({ onBack, onSingle, onParty }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Route Mode" onBack={onBack} />

      <div className="flex flex-col items-center gap-6 px-6 mt-4">
        <GameButtons variant="task" size="square" onClick={onSingle}>
          Single
        </GameButtons>
        <GameButtons variant="party" size="square" onClick={onParty}>
          Party
        </GameButtons>
      </div>

    </div>
  );
}
