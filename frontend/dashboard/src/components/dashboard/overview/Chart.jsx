import React from 'react'
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import AreaChart from './charts/AreaChart';

export default function Chart({color, type, title, value}) {

    const renderChart = () => {
        switch(type) {
            case "line":
                return <LineChart />;
            case "bar":
                return <BarChart />;
            case "pie":
                return <PieChart />;
            case "area":
                return <AreaChart />;
            default:
                return <LineChart />;
        }
    }

  return (
    <div className={`bg-white p-3 grow-1 border-t-5 ${color} h-full shadow rounded-lg flex flex-col`}>
        <h6 className='text-gray-500 text-xs'>{title}</h6>
        <h1 className='text-black font-bold text-lg'>{value}</h1>
        <div className="grow-1">
            {renderChart()}
        </div>
    </div>
  )
}
