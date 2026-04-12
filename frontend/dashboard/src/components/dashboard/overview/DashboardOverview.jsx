import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Map from './Map';
import Chart from './Chart';
import ElementDetail from './ElementDetail';

export default function DashboardOverview({setSelectedItem}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleChangeModelOpen = (value) => {
        setIsModalOpen(value);
    }

  return (
    <div className='flex flex-col h-full'>
      <div className='h-[70px] bg-white w-full border-b border-gray-300 shadow flex items-center justify-between px-[20px]'>
        <div>
          <h1 className='font font-bold text-xl'>Alboretum Overview</h1>
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
      <div className='p-[20px] flex flex-col gap-5 h-full'>
        <div className='w-full h-[375px] flex items-center justify-center gap-3'>
            <Map showExtent={isModalOpen} setShowExtent={setIsModalOpen} />
            {
              isModalOpen && (
                <ElementDetail />
              )
            }
        </div>
        <div className="flex justify-between gap-3 grow-1">
          <Chart color="border-secondary-green" type="bar" title="Carbon offset" value="1,234" />
          <Chart color="border-blue-500" type="line" title="Netzero progress" value="85%" />
          <Chart color="border-yellow-500" type="pie" title="Tree Canopy Cover" value="12" />
          <Chart color="border-red-500" type="area" title="Species Catalogued" value="78%" />
        </div>
      </div>
    </div>
  )
}
