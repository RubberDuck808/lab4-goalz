import React from 'react';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

export default function Login({ onLogin, onNavigateToSignUp }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-zinc-900">

      <Logo className="mt-6 self-center" />

      <div className="flex flex-col items-center flex-1 justify-center space-y-4 -mt-16">
        <h1 className="font-custom-button font-bold text-[32px] text-zinc-800 uppercase tracking-wide mb-4">
          Login
        </h1>

        <TextInput placeholder="email" type="email" />
        <TextInput placeholder="password" type="password" />

        <div className="pt-6">
          <GameButtons variant="task" onClick={onLogin}>
            Login
          </GameButtons>
        </div>

        <button
          onClick={onNavigateToSignUp}
          className="text-sm text-[#1CB0F6] underline font-custom-button"
        >
          I don't have an account yet.
        </button>
      </div>

    </div>
  );
}
