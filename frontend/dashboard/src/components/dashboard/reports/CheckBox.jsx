import React, { useState } from 'react'

export default function CheckBox({name, onChange, checked}) {
  return (
    <div>
        <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="hidden"
            />
            <span className={`h-5 w-5 border-2 rounded-md flex items-center justify-center transition-colors ${
              checked ? 'bg-game-green border-game-green' : 'border-border bg-white'
            }`}>
              {checked && <i className="fa-solid fa-check text-white text-xs"></i>}
            </span>
            <span className="ml-2 text-black">{name}</span>
        </label>
    </div>
  )
}
