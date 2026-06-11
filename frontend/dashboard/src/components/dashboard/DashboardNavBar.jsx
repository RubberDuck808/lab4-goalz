import React from 'react'

export default function DashboardNavBar({ title }) {
  return (
    <div className='h-[60px] bg-white w-full border-b border-border flex items-center justify-between px-5 shrink-0'>
      <div className='ps-[50px] md:ps-0'>
        <h1 className='font-bold text-lg text-text-primary'>{title}</h1>
        <p className='text-text-secondary text-xs hidden md:block'>loggin-dashboard.com</p>
      </div>
      <div className='hidden md:flex items-center gap-3'>
        <button className='flex items-center gap-2 bg-game-blue border-b-[3px] border-game-blue-border text-white text-sm font-bold px-4 h-9 rounded-xl cursor-pointer hover:opacity-90 transition'>
          Export <i className='fa-solid fa-arrow-up-from-bracket text-xs' />
        </button>
      </div>
    </div>
  )
}
