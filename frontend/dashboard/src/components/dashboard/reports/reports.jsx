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
  <div className="flex flex-col min-h-screen">
    <DashboardNavbar title="Generate Reports" />
    <ToastContainer position="top-right" autoClose={3000} />

    <div className="p-4 md:p-5 w-full flex flex-col gap-5">
      <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
        <h1 className="text-lg md:text-xl font-bold">Time range</h1>
        <p className="text-sm md:text-md text-gray-500 font-light">
          Select the date range between which dates you want to generate the report.
        </p>

        <div className="flex flex-col md:flex-row md:items-center gap-5 mt-4">
          <div className="flex flex-col flex-1">
            <label className="font-bold">From</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="font-bold">To</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
        <h1 className="text-lg md:text-xl font-bold">Report content</h1>
        <p className="text-sm md:text-md text-gray-500 font-light">
          Select which content you want to include into your report.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-2">
          <div className="p-4 rounded-lg gap-3 flex flex-col">
            <CheckBox name="Trees" checked={checkboxes.trees} onChange={() => handleCheckboxChange("trees")} />
            <CheckBox name="Bushes" checked={checkboxes.bushes} onChange={() => handleCheckboxChange("bushes")} />
            <CheckBox name="Water" checked={checkboxes.water} onChange={() => handleCheckboxChange("water")} />
            <CheckBox name="Species" checked={checkboxes.species} onChange={() => handleCheckboxChange("species")} />
          </div>

          <div className="p-4 rounded-lg gap-3 flex flex-col">
            <CheckBox name="Sensor data" checked={checkboxes.sensorData} onChange={() => handleCheckboxChange("sensorData")} />
            <CheckBox name="Light" checked={checkboxes.light} onChange={() => handleCheckboxChange("light")} />
            <CheckBox name="Temperature" checked={checkboxes.temperature} onChange={() => handleCheckboxChange("temperature")} />
            <CheckBox name="Humidity" checked={checkboxes.humidity} onChange={() => handleCheckboxChange("humidity")} />
          </div>

          <div className="p-4 rounded-lg gap-3 flex flex-col">
            <CheckBox name="Green vs non-green" checked={checkboxes.greenVsNonGreen} onChange={() => handleCheckboxChange("greenVsNonGreen")} />
            <CheckBox name="Native vs non-native" checked={checkboxes.nativeVsNonNative} onChange={() => handleCheckboxChange("nativeVsNonNative")} />
            <CheckBox name="Biodiversity" checked={checkboxes.biodiversity} onChange={() => handleCheckboxChange("biodiversity")} />
            <CheckBox name="Net zero-goal indicator" checked={checkboxes.netZero} onChange={() => handleCheckboxChange("netZero")} />
          </div>

          <div className="p-4 rounded-lg gap-3 flex flex-col">
            <CheckBox name="Line charts" checked={checkboxes.lineCharts} onChange={() => handleCheckboxChange("lineCharts")} />
            <CheckBox name="Bar charts" checked={checkboxes.barCharts} onChange={() => handleCheckboxChange("barCharts")} />
            <CheckBox name="Pie charts" checked={checkboxes.pieCharts} onChange={() => handleCheckboxChange("pieCharts")} />
            <CheckBox name="Alboretum map" checked={checkboxes.map} onChange={() => handleCheckboxChange("map")} />
          </div>
        </div>
      </div>

      <div className="bg-white w-full p-4 border border-gray-300 rounded-lg shadow">
        <h1 className="text-lg md:text-xl font-bold">Report type</h1>
        <p className="text-sm md:text-md text-gray-500 font-light">
          Select a file extension for each type of report you want to generate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2 p-4">
          <CheckBox name="CSV" checked={reportTypeCheckboxes.csv} onChange={() => handleReportTypeCheckboxChange("csv")} />
          <CheckBox name="PDF" checked={reportTypeCheckboxes.pdf} onChange={() => handleReportTypeCheckboxChange("pdf")} />
          <CheckBox name="Plain text" checked={reportTypeCheckboxes.txt} onChange={() => handleReportTypeCheckboxChange("txt")} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="bg-secondary-green rounded-lg w-full sm:w-[150px] py-2 text-white"
          onClick={handleOnGenerateReport}
        >
          Generate
        </button>
      </div>
    </div>
  </div>
);
}
