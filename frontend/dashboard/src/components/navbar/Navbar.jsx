import React from 'react'
import Navitem from './Navitem'

export default function Navbar() {
  return (
    <nav className='bg-secondary-black w-full h-full'>
        <div className="bg-black w-full h-[90px] p-[20px] flex gap-3 flex items-center">
            <div className='w-[50px] h-[50px] rounded-full bg-secondary-green flex items-center justify-center'>
                <i class="fa-solid fa-leaf text-white text-xl"></i>
            </div>
            <div>
                <h1 className='font text-lg font-bold text-white'>Humber</h1>
                <h2 className='font text-sm text-light-green italic'>Sustainability</h2>
                <h3 className='font text-xs italic text-light-green'>Alboretum dashboard</h3>
            </div>
        </div>
        <div className='w-full flex flex-col align-center'>
            <Navitem />
        </div>
    </nav>
  )
}
