import { useState, useRef, useEffect } from 'react'
import DashboardNavBar from '../DashboardNavBar'
import { importDatasetService } from '../../../services/importDatasetService';
import PreviewTable from './PreviewTable';

export default function ImportData() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedColumns , setUploadedColumns] = useState([]);
  const [uploadedRecords , setUploadedRecords] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Uploaded Columns:", uploadedColumns);
    console.log("Uploaded Records:", uploadedRecords);
    }, [uploadedColumns, uploadedRecords]);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    const result = await importDatasetService.uploadCSV(files); 
    console.log("Result from uploadCSV:", result);

    setUploadedRecords(result[0]);

    setSelectedFiles(files);
  };

  const handleStoreData = async () => {
    try {
      const response = await importDatasetService.storeCSV(uploadedRecords);
        console.log("Store response:", response);
    } catch (error) {
        console.error("Error storing records:", error);
    }
    };

  return (
    <div className='flex flex-col'>
        <DashboardNavBar title="Import Dataset" />
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
