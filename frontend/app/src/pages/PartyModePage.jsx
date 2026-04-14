import React from 'react';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

export default function PartyModePage({ onBack, onJoinParty, onCreateParty }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Party Mode" onBack={onBack} />

      <div className="flex flex-col items-center flex-1 justify-center space-y-4 -mt-16">
        <TextInput placeholder="Party code" />

        <div className="pt-2">
          <GameButtons variant="task" onClick={onJoinParty}>
            Join Party
          </GameButtons>
        </div>

        <button onClick={onCreateParty} className="text-sm text-zinc-700 underline font-custom-button">
          Create party
        </button>
      </div>

    </div>
  );
}
