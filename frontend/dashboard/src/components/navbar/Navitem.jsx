import React from 'react'

export default function Navitem({name, icon, selectedItem, setSelectedItem}) {

  const isSelected = selectedItem === name;

  return (
    <div className={`h-[60px] w-full flex align-center p-[20px] gap-3 cursor-pointer ${isSelected && 'bg-secondary-green border-s-3 border-white'}`} onClick={() => setSelectedItem(name)}>
        <i class={`fa-solid ${icon} text-white`}></i>
        <p className={isSelected ? 'font text-white font-bold' : 'font text-gray-500'}>
            {name}
        </p>
    </div>
  )
}
