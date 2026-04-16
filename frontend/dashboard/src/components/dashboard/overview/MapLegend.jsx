import React from 'react'

export default function MapLegend({text, color}) {
  return (
    <div className='flex items-center gap-2'>
      <div className={`w-4 h-4 rounded-full ${color}`}></div>
      <span className='font text-xs text-gray-700'>{text}</span>
    </div>
  )
}
