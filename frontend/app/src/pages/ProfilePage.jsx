import React from 'react';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import BottomNavBar from '../components/BottomNavBar';
import userAvatar from '../assets/UserAvatar_1.png';

export default function ProfilePage({ onNavigateHome, onNavigateToProfile }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <PageHeader title="PROFILE" />

      {/* Profile info row */}
      <div className="flex px-[28px] mt-4 justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="font-custom-button font-bold text-[28px] text-zinc-800">Username</span>
          <span className="font-custom-button text-[14px] text-zinc-500">Joined &lt;Month&gt; &lt;Year&gt;</span>
          <span className="font-custom-button font-bold text-[22px] text-zinc-800 mt-1">Badges 0</span>
          <div className="mt-4">
            <GameButtons variant="task" size="half">
              EDIT PROFILE
            </GameButtons>
          </div>
        </div>
        <img
          src={userAvatar}
          alt="User Avatar"
          className="w-[160px] h-[160px] object-cover rounded-[24px] flex-shrink-0"
        />
      </div>

      <div className="flex-1" />

      <BottomNavBar onNavigateHome={onNavigateHome} onNavigateToProfile={onNavigateToProfile} />

    </div>
  );
}
