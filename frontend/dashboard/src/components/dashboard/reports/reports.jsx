import React, { useEffect, useState } from 'react'
import CheckBox from './CheckBox'
import DashboardNavbar from '../DashboardNavBar'
import { generateReportSerivce } from '../../../services/generateReportService';
import { ToastContainer, toast } from 'react-toastify';

export default function Reports() {
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');
    const [reportTypeCheckboxes, setReportTypeCheckboxes] = useState({
        csv: false, pdf: false, txt: false,
    });
    const [checkboxes, setCheckboxes] = useState({
        trees: false, bushes: false, water: false, species: false,
        sensorData: false, light: false, temperature: false, humidity: false,
        greenVsNonGreen: false, nativeVsNonNative: false, biodiversity: false, netZero: false,
        lineCharts: false, barCharts: false, pieCharts: false, map: false,
    });

    const handleCheckboxChange = (name) => setCheckboxes(prev => ({ ...prev, [name]: !prev[name] }));
    const handleReportTypeCheckboxChange = (name) => setReportTypeCheckboxes(prev => ({ ...prev, [name]: !prev[name] }));

    const [generating, setGenerating] = useState(false);

    const handleOnGenerateReport = async () => {
        setGenerating(true);
        try {
            await generateReportSerivce.generateReport(fromDate, toDate, checkboxes, reportTypeCheckboxes);
            toast.success('Report successfully generated!');
        } catch (err) {
            toast.error(err.message || 'Failed to generate report.');
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        const today = new Date();
        const priorDate = new Date().setDate(today.getDate() - 30);
        setFromDate(new Date(priorDate).toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
    }, []);

    const inputCls = 'border border-border rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30 bg-white';
    const cardCls = 'bg-white w-full p-5 rounded-xl border border-border flex flex-col gap-1';

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardNavbar title="Generate Reports" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="p-5 flex flex-col gap-4">

                {/* Time range */}
                <div className={cardCls}>
                    <h2 className="text-sm font-bold text-text-primary">Time range</h2>
                    <p className="text-xs text-text-secondary">Select the date range for the report.</p>
                    <div className="flex flex-col md:flex-row gap-4 mt-3">
                        <div className="flex flex-col flex-1 gap-1">
                            <label className="text-xs font-semibold text-text-primary">From</label>
                            <input type="date" className={inputCls} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                            <label className="text-xs font-semibold text-text-primary">To</label>
                            <input type="date" className={inputCls} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Report content */}
                <div className={cardCls}>
                    <h2 className="text-sm font-bold text-text-primary">Report content</h2>
                    <p className="text-xs text-text-secondary">Select which content to include.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
                        <div className="flex flex-col gap-3">
                            <CheckBox name="Trees"   checked={checkboxes.trees}   onChange={() => handleCheckboxChange("trees")} />
                            <CheckBox name="Bushes"  checked={checkboxes.bushes}  onChange={() => handleCheckboxChange("bushes")} />
                            <CheckBox name="Water"   checked={checkboxes.water}   onChange={() => handleCheckboxChange("water")} />
                            <CheckBox name="Species" checked={checkboxes.species} onChange={() => handleCheckboxChange("species")} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <CheckBox name="Sensor data"  checked={checkboxes.sensorData}   onChange={() => handleCheckboxChange("sensorData")} />
                            <CheckBox name="Light"        checked={checkboxes.light}         onChange={() => handleCheckboxChange("light")} />
                            <CheckBox name="Temperature"  checked={checkboxes.temperature}   onChange={() => handleCheckboxChange("temperature")} />
                            <CheckBox name="Humidity"     checked={checkboxes.humidity}       onChange={() => handleCheckboxChange("humidity")} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <CheckBox name="Green vs non-green"    checked={checkboxes.greenVsNonGreen}    onChange={() => handleCheckboxChange("greenVsNonGreen")} />
                            <CheckBox name="Native vs non-native"  checked={checkboxes.nativeVsNonNative}  onChange={() => handleCheckboxChange("nativeVsNonNative")} />
                            <CheckBox name="Biodiversity"          checked={checkboxes.biodiversity}        onChange={() => handleCheckboxChange("biodiversity")} />
                            <CheckBox name="Net zero-goal"         checked={checkboxes.netZero}             onChange={() => handleCheckboxChange("netZero")} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <CheckBox name="Line charts"    checked={checkboxes.lineCharts} onChange={() => handleCheckboxChange("lineCharts")} />
                            <CheckBox name="Bar charts"     checked={checkboxes.barCharts}  onChange={() => handleCheckboxChange("barCharts")} />
                            <CheckBox name="Pie charts"     checked={checkboxes.pieCharts}  onChange={() => handleCheckboxChange("pieCharts")} />
                            <CheckBox name="Interactive map"  checked={checkboxes.map}        onChange={() => handleCheckboxChange("map")} />
                        </div>
                    </div>
                </div>

                {/* Report type */}
                <div className={cardCls}>
                    <h2 className="text-sm font-bold text-text-primary">Report type</h2>
                    <p className="text-xs text-text-secondary">Select the file format.</p>
                    <div className="flex gap-6 mt-3 px-1">
                        <CheckBox name="CSV"        checked={reportTypeCheckboxes.csv} onChange={() => handleReportTypeCheckboxChange("csv")} />
                        <CheckBox name="PDF"        checked={reportTypeCheckboxes.pdf} onChange={() => handleReportTypeCheckboxChange("pdf")} />
                        <CheckBox name="Plain text" checked={reportTypeCheckboxes.txt} onChange={() => handleReportTypeCheckboxChange("txt")} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        className="bg-game-green border-b-[3px] border-game-green-border text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        onClick={handleOnGenerateReport}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <i className="fa-solid fa-spinner animate-spin text-xs" />
                                Generating...
                            </>
                        ) : (
                            'Generate Report'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
