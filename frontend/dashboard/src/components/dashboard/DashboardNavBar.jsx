import React from 'react'

export default function DashboardNavBar({title}) {
  return (
    <div className='h-[70px] bg-white w-full border-b border-gray-300 shadow flex items-center justify-between px-[20px]'>
        <div>
          <h1 className='font font-bold text-xl'>{title}</h1>
          <p className='font text-gray-500 font-extralight text-sm'>Office of Sustainability  ·  Now updated</p>
        </div>
        <div className='flex items-center justify-between w-[450px] gap-3'>
          <select name="" id="" className='w-[128px] h-10 border border-gray-300 rounded-lg bg-white px-3 text-sm cursor-pointer'>
            <option value="">Filter</option>
          </select>
          <select name="" id="" className='w-[128px] h-10 border border-gray-300 rounded-lg bg-white px-3 text-sm cursor-pointer'>
            <option value="">Timeline</option>
          </select>
          <button 
            className='w-[128px] h-10 bg-secondary-green text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer'
            onClick={() => setSelectedItem("Reports")}
          >
            Export <i className='fa-solid fa-arrow-up-from-bracket'></i>
          </button>
        </div>
      </div>
  )
}
