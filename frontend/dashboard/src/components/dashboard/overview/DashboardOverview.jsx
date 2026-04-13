import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Map from './Map';
import Chart from './Chart';
import ElementDetail from './ElementDetail';
import DashboardNavBar from '../DashboardNavBar';

export default function DashboardOverview({setSelectedItem}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleChangeModelOpen = (value) => {
        setIsModalOpen(value);
    }

  return (
    <div className='flex flex-col h-full'>
      <DashboardNavBar title="Alboretum Overview" />
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
