import React from 'react'

export default function DashboardNavBar({title}) {
  return (
    <div className='h-[70px] bg-white w-full border-b border-gray-300 shadow flex items-center justify-between px-[20px]'>
        <div className='ps-[50px] md:ps-0'>
          <h1 className="font-bold text-lg md:text-xl">{title}</h1>
          <p className='font text-gray-500 font-extralight text-sm hidden md:block'>Office of Sustainability  ·  Now updated</p>
        </div>
        <div className='flex flex-row-reverse items-center justify-between gap-3'>
          <button 
            className='hidden md:block w-[128px] h-10 bg-secondary-green text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer'
            onClick={() => setSelectedItem("Reports")}
          >
            Export <i className='fa-solid fa-arrow-up-from-bracket'></i>
          </button>
          <div className='flex gap-3'>
            <select name="" id="" className='w-[128px] h-10 border border-gray-300 rounded-lg bg-white px-3 text-sm cursor-pointer'>
              <option value="">Filter</option>
            </select>
            <select name="" id="" className='w-[128px] h-10 border border-gray-300 rounded-lg bg-white px-3 text-sm cursor-pointer'>
              <option value="">Timeline</option>
            </select>
          </div>
        </div>
      </div>
  )
}
