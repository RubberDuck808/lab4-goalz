import React, { useEffect } from 'react'
import CheckBox from './CheckBox'
import DashboardNavbar from '../DashboardNavBar'

export default function reports() {
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    useEffect(() => {
        const today = new Date();
        const priorDate = new Date().setDate(today.getDate() - 30);

        setFromDate(new Date(priorDate).toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
    }, []);

  return (
    <div className="flex flex-col">
        <DashboardNavbar title="Generate Reports" />
        <div className='p-5 w-full h-full flex flex-col gap-5'>
            <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
                <h1 className='text-xl font-bold font'>Time range</h1>
                <p className='text-md font text-gray-500 font-light'>
                    Select the date range between which dates you want to generate the report.
                </p>
                <div className='flex jusify-between items-center gap-5 mt-4'>
                    <div className="flex flex-col grow-1">
                        <label className='font font-bold' htmlFor="">From</label>
                        <input 
                            type="date" 
                            className='border border-gray-300 rounded-md p-2'  
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            />
                    </div>
                    <div className="flex flex-col grow-1">
                        <label className='font font-bold' htmlFor="">To</label>
                            <input 
                                type="date" 
                                className='border border-gray-300 rounded-md p-2'  
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                />
                    </div>
                </div>
            </div>
            <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
                <h1 className='text-xl font-bold font'>Report content</h1>
                <p className='text-md font text-gray-500 font-light'>
                    Select which content you want to include into your report.
                </p>
                <div className='flex jusify-between items-center gap-5 mt-2'>
                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox name='Trees' />
                        <CheckBox name='Bushes' />
                        <CheckBox name='Water' />
                        <CheckBox name='Species' />
                    </div>
                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox name='Size' />
                        <CheckBox name='Healthscore' />
                        <CheckBox name='Longitude' />
                        <CheckBox name='Latitude' />
                    </div>
                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox name='Green vs non-green' />
                        <CheckBox name='Native vs non-native' />
                        <CheckBox name='Biodiversity' />
                        <CheckBox name='Net zero-goal indicator' />
                    </div>
                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox name='Line charts' />
                        <CheckBox name='Bar charts' />
                        <CheckBox name='Pie charts' />
                        <CheckBox name='Alboretum map' />
                    </div>
                </div>
            </div>
            <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
                <h1 className='text-xl font-bold font'>Report type</h1>
                <p className='text-md font text-gray-500 font-light'>
                    Select a file extension for each type of report you want to generate.
                </p>
                <div className='flex jusify-between items-center gap-8 mt-2 p-4'>
                    <CheckBox name='CSV' />
                    <CheckBox name='PDF' />
                    <CheckBox name='Plain text' />
                </div>
            </div>
            <div className='flex flex-row-reverse'>
                <button className='bg-secondary-green rounded-lg w-[150px] py-2 text-white'>
                    Generate
                </button>
            </div>
        </div>
    </div>
    
  )
}
