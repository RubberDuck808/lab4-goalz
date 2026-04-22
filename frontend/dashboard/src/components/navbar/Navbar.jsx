import React from 'react'
import Navitem from './Navitem'

export default function Navbar({ selectedItem, setSelectedItem }) {
  return (
    <nav className='bg-secondary-black w-full h-full'>
        <div className="bg-black w-full h-[70px] p-[20px] flex gap-3 flex items-center">
            <div className='w-[45px] h-[45px] rounded-full bg-secondary-green flex items-center justify-center'>
                <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <div>
                <h1 className='font text-md font-bold text-white'>Humber</h1>
                <h2 className='font text-sm text-light-green italic'>Sustainability</h2>
                <h3 className='font text-[10px] italic text-light-green'>Alboretum dashboard</h3>
            </div>
        </div>
        <div className='w-full flex flex-col align-center'>
            <Navitem name="Overview" icon="fa-chart-line" selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            <Navitem name="Arboretum Map" icon="fa-map" selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            <Navitem name="Reports" icon="fa-file-export" selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            <Navitem name="Import dataset" icon="fa-upload" selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            <Navitem name="Settings" icon="fa-cog" selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        </div>
    </nav>
  )
}
