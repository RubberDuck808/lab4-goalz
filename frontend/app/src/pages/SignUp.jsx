import React from 'react';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

export default function SignUp({ onSignUp, onNavigateToLogin }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center font-sans text-zinc-900">

      {/* Logo */}
      <Logo className="mt-6" />

      {/* Sign up form */}
      <div className="flex flex-col items-center flex-1 justify-center space-y-4 -mt-16">
        <h1 className="font-custom-button font-bold text-[32px] text-zinc-800 uppercase tracking-wide mb-4">
          Sign Up
        </h1>

        <TextInput placeholder="name" type="text" />
        <TextInput placeholder="email" type="email" />
        <TextInput placeholder="password" type="password" />
        <TextInput placeholder="repeat password" type="password" />

        <div className="pt-6">
          <GameButtons variant="task" onClick={onSignUp}>
            Sign Up
          </GameButtons>
        </div>

        <button
          onClick={onNavigateToLogin}
          className="text-sm text-zinc-700 underline font-custom-button"
        >
          I already have an account.
        </button>
      </div>

    </div>
  );
}
