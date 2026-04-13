import React, { useState } from 'react'

export default function CheckBox({name}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div>
        <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleChange}
              className="hidden"
            />
            <span className={`h-5 w-5 border-2 rounded flex items-center justify-center transition-colors ${
              isChecked ? 'bg-secondary-green border-secondary-green' : 'border-gray-300 bg-white'
            }`}>
              {isChecked && <i className="fa-solid fa-check text-white text-xs"></i>}
            </span>
            <span className="ml-2 text-black font">{name}</span>
        </label>
    </div>
  )
}
