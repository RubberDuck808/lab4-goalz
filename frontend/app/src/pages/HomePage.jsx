import React from 'react';
import BottomNavBar from '../components/BottomNavBar';
import GameButtons from '../components/GameButtons';
import PageHeader from '../components/PageHeader';

export default function HomePage({ onNavigateHome, onNavigateToProfile }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="Route" />

      <div className="flex-1 flex items-center justify-center">
        <GameButtons variant="accept">
          Start Route
        </GameButtons>
      </div>

      <BottomNavBar onNavigateHome={onNavigateHome} onNavigateToProfile={onNavigateToProfile} />

    </div>
  );
}
