import React from 'react';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

export default function CreatePartyPage({ onBack, onCreate }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Party Mode" onBack={onBack} />

      <div className="flex flex-col items-center flex-1 justify-center space-y-4 -mt-16">

        <TextInput placeholder="Party name" />

        <div className="flex flex-row gap-4">
          <TextInput placeholder="Username" className="w-[156px]" />
          <GameButtons variant="task" size="half">
            Invite
          </GameButtons>
        </div>

        <div className="pt-2">
          <GameButtons variant="task" onClick={onCreate}>
            Create Party
          </GameButtons>
        </div>

      </div>

    </div>
  );
}
