import { useState, useRef, useEffect } from 'react'
import DashboardNavBar from '../DashboardNavBar'
import { importDatasetService } from '../../../services/importDatasetService';
import PreviewTable from './PreviewTable';
import Loading from '../../Loading/Loading';
import { setOptions } from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ImportData() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedColumns , setUploadedColumns] = useState([]);
  const [uploadedRecords , setUploadedRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    setIsLoading(true);
    const files = Array.from(event.target.files);
    try {
        const result = await importDatasetService.uploadCSV(files); 
        
        setUploadedRecords(result[0]);
        setSelectedFiles(files);
    } 
    catch (error) {
        
    } finally {
        setIsLoading(false);
    }
  };

  const handleStoreData = async () => {
    setIsLoading(true);
    try {
        const response = await importDatasetService.storeCSV(uploadedRecords);
        toast.success('Dataset succesfully imported!');
        setSelectedFiles([]);
        setUploadedRecords([]);
        setUploadedColumns([]);

    } catch (error) {
        console.error("Error storing records:", error);
        toast.error(error.message || 'Failed to create sensor.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col relative'>
        <DashboardNavBar title="Import Dataset" />
        {
            isLoading && <Loading />
        }
        <ToastContainer position="top-right" autoClose={3000} />
        <div className='flex flex-col w-full grow-1 p-4 gap-5'>
            <div className='flex'>
                <button className='bg-secondary-green hover:bg-green-600 rounded-lg px-4 py-2 text-white cursor-pointer flex items-center gap-2 transition-colors'>
                    <i className="fa-solid fa-download"></i>
                    Download template file
                </button>
            </div>
            <div 
                className='bg-white rounded w-full p-5 border border-gray-300 rounded-lg shadow flex gap-3 cursor-pointer'
                onClick={handleDivClick}
            >
                <div className='w-[100px] h-[100px] rounded bg-secondary-green flex justify-center items-center'>
                    <i className="fa-solid fa-upload text-white text-4xl"></i>
                </div>
                <div className='grow-1 h-full'>
                    <h1 className='font font-bold text-3xl text-black'>Upload Dataset</h1>
                    <p className='font text-gray-500 font-light mt-1'>
                        {selectedFiles.length > 0 
                          ? `${selectedFiles.length} CSV file(s) selected: ${selectedFiles.map(f => f.name).join(', ')}`
                          : 'Upload your dataset in CSV format to visualize and analyze it on the map.'
                        }
                    </p>
                    <p className='font text-gray-400 text-sm mt-2'>Accepted file type: CSV</p>
                </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              multiple
              style={{ display: 'none' }}
            />
            {
                uploadedRecords.length > 0 && (
                    <>
                        <div className='bg-white rounded w-full p-5 border border-gray-300 rounded-lg shadow mt-4'>
                            <h2 className='text-xl font-bold text-gray-800 mb-4'>Imported Data Preview</h2>
                            <div className="relative overflow-x-auto shadow-md rounded-lg mt-2">
                                <PreviewTable uploadedRecords={uploadedRecords} />
                            </div>
                        </div>
                        <div className='flex flex-row-reverse'>
                            <button className='bg-secondary-green rounded-lg w-[150px] py-2 text-white cursor-pointer' onClick={handleStoreData}>
                                Import dataset
                            </button>
                        </div>
                    </>
                )
            }
            
        </div>
    </div>
  )
}
