import React, { useEffect, useState } from 'react'
import CheckBox from './CheckBox'
import DashboardNavbar from '../DashboardNavBar'
import { generateReportSerivce } from '../../../services/generateReportService';
import { ToastContainer, toast } from 'react-toastify';

export default function reports() {
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');
    const [reportTypeCheckboxes, setReportTypeCheckboxes] = useState({
        csv: false,
        pdf: false,
        txt: false
    });

    const [checkboxes, setCheckboxes] = useState({
        trees: false,
        bushes: false,
        water: false,
        species: false,

        sensorData: false,
        light: false,
        temperature: false,
        humidity: false,

        greenVsNonGreen: false,
        nativeVsNonNative: false,
        biodiversity: false,
        netZero: false,

        lineCharts: false,
        barCharts: false,
        pieCharts: false,
        map: false,
    });

    const handleCheckboxChange = (name) => {
        setCheckboxes(prev => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const handleReportTypeCheckboxChange = (name) => {
        setReportTypeCheckboxes(prev => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const handleOnGenerateReport = () => {
        try {
            generateReportSerivce.generateReport(fromDate, toDate, checkboxes, reportTypeCheckboxes)
            toast.success('Report succesfully generated!');
        }
        catch(err)
        {
            toast.error(err.message || 'Failed to create sensor.');
        }
    }

    useEffect(() => {
        const today = new Date();
        const priorDate = new Date().setDate(today.getDate() - 30);

        setFromDate(new Date(priorDate).toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
    }, []);

  return (
    <div className="flex flex-col">
        <DashboardNavbar title="Generate Reports" />
        <ToastContainer position="top-right" autoClose={3000} />
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
                        <CheckBox 
                            name='Trees'
                            checked={checkboxes.trees}
                            onChange={() => handleCheckboxChange("trees")}  
                        />
                        <CheckBox 
                            name='Bushes'
                            checked={checkboxes.bushes}
                            onChange={() => handleCheckboxChange("bushes")}  
                        />
                        <CheckBox 
                            name='Water'
                            checked={checkboxes.water}
                            onChange={() => handleCheckboxChange("water")}  
                        />
                        <CheckBox 
                            name='Species'
                            checked={checkboxes.species}
                            onChange={() => handleCheckboxChange("species")}  
                        />
                    </div>

                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox 
                            name='Sensor data'
                            checked={checkboxes.sensorData}
                            onChange={() => handleCheckboxChange("sensorData")}  
                        />
                        <CheckBox 
                            name='Light'
                            checked={checkboxes.light}
                            onChange={() => handleCheckboxChange("light")}  
                        />
                        <CheckBox 
                            name='Temprature'
                            checked={checkboxes.temperature}
                            onChange={() => handleCheckboxChange("temperature")}  
                        />
                        <CheckBox 
                            name='Humidity'
                            checked={checkboxes.humidity}
                            onChange={() => handleCheckboxChange("humidity")}  
                        />
                    </div>

                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox 
                            name='Green vs non-green'
                            checked={checkboxes.greenVsNonGreen}
                            onChange={() => handleCheckboxChange("greenVsNonGreen")}  
                        />
                        <CheckBox 
                            name='Native vs non-native'
                            checked={checkboxes.nativeVsNonNative}
                            onChange={() => handleCheckboxChange("nativeVsNonNative")}  
                        />
                        <CheckBox 
                            name='Biodiversity'
                            checked={checkboxes.biodiversity}
                            onChange={() => handleCheckboxChange("biodiversity")}  
                        />
                        <CheckBox 
                            name='Net zero-goal indicator'
                            checked={checkboxes.netZero}
                            onChange={() => handleCheckboxChange("netZero")}  
                        />
                    </div>

                    <div className="h-full grow-1 p-4 rounded-lg gap-3 flex flex-col">
                        <CheckBox 
                            name='Line charts'
                            checked={checkboxes.lineCharts}
                            onChange={() => handleCheckboxChange("lineCharts")}  
                        />
                        <CheckBox 
                            name='Bar charts'
                            checked={checkboxes.barCharts}
                            onChange={() => handleCheckboxChange("barCharts")}  
                        />
                        <CheckBox 
                            name='Pie charts'
                            checked={checkboxes.pieCharts}
                            onChange={() => handleCheckboxChange("pieCharts")}  
                        />
                        <CheckBox 
                            name='Alboretum map'
                            checked={checkboxes.map}
                            onChange={() => handleCheckboxChange("map")}  
                        />
                    </div>
                </div>
            </div>
            <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
                <h1 className='text-xl font-bold font'>Report type</h1>
                <p className='text-md font text-gray-500 font-light'>
                    Select a file extension for each type of report you want to generate.
                </p>
                <div className='flex jusify-between items-center gap-8 mt-2 p-4'>
                    <CheckBox 
                        name='CSV'
                        checked={reportTypeCheckboxes.csv}
                        onChange={() => handleReportTypeCheckboxChange("csv")}
                    />
                    <CheckBox
                        name='PDF'
                        checked={reportTypeCheckboxes.pdf}
                        onChange={() => handleReportTypeCheckboxChange("pdf")}
                    />
                    <CheckBox
                        name='Plain text'
                        checked={reportTypeCheckboxes.txt}
                        onChange={() => handleReportTypeCheckboxChange("txt")}
                    />
                </div>
            </div>
            <div className='flex flex-row-reverse'>
                <button className='bg-secondary-green rounded-lg w-[150px] py-2 text-white' onClick={handleOnGenerateReport}>
                    Generate
                </button>
            </div>
        </div>
    </div>
    
  )
}
