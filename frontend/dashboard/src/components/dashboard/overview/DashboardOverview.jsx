import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Map from './Map';
import Chart from './Chart';
import DashboardNavBar from '../DashboardNavBar';
import { overviewService } from '../../../services/overviewService';
import ManageElement from './ManageElement';
import ElementDetails from './ElementDetails';

export default function DashboardOverview({setSelectedItem}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [natureElements, setNatureElements] = useState([]);
    const [sensorsData, setSensorsData] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);

    useEffect(() => {
      if(selectedElement){
        setSelectedElement(null);
      }
    }, [isModalOpen]);

    useEffect(() => {
      if(isModalOpen){
        setIsModalOpen(false);
      }
    }, [selectedElement])

    useEffect(() => {
      const fetchData = async () => {
        const data = await overviewService.getAllElements();
        if (data) {
          setNatureElements(data.element);
          setSensorsData(data.sensors);
        } 
      };
      fetchData();
    }, []);

    const handleOnExtentClick = () => {
        setIsModalOpen(false);
        setSelectedElement(null);
    }

    const handleChangeModelOpen = (value) => {
        setIsModalOpen(value);
    }

  return (
    <div className='flex flex-col h-full'>
      <DashboardNavBar title="Alboretum Overview" />
      <div className='p-[20px] flex flex-col gap-5 h-full'>
        <div className='w-full h-[375px] flex items-center justify-center gap-3'>
            <Map showExtent={isModalOpen || !!selectedElement} setShowExtent={handleOnExtentClick} isEditModalOpen={setIsModalOpen} elements={natureElements} setSelectedElement={setSelectedElement} />
            {
              isModalOpen && (
                <ManageElement />
              )
            }
            {
              selectedElement && (
                <ElementDetails element={selectedElement} />
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
