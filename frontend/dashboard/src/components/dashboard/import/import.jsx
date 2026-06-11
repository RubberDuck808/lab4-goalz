import { useState, useRef } from 'react'
import DashboardNavBar from '../DashboardNavBar'
import { importDatasetService } from '../../../services/importDatasetService';
import PreviewTable from './PreviewTable';
import Loading from '../../Loading/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ImportData() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    setIsLoading(true);
    const files = Array.from(event.target.files);
    try {
      const result = await importDatasetService.uploadCSV(files);
      setUploadedRecords(result[0]);
      setSelectedFiles(files);
    } catch {
      toast.error('Failed to parse file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreData = async () => {
    setIsLoading(true);
    try {
      await importDatasetService.storeCSV(uploadedRecords);
      toast.success('Dataset successfully imported!');
      setSelectedFiles([]);
      setUploadedRecords([]);
    } catch (error) {
      toast.error(error.message || 'Failed to import dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      'elementName;elementType;latitude;longitude;imageUrl;isGreen',
      'Oak Tree;Tree;43.726000;-79.609900;;true',
      'Rose Bush;Shrub;43.725500;-79.610500;;false'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='flex flex-col relative min-h-screen'>
      <DashboardNavBar title="Import Dataset" />
      {isLoading && <Loading />}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className='flex flex-col w-full p-5 gap-4'>

        {/* Download template */}
        <div className='flex'>
          <button
            onClick={handleDownloadTemplate}
            className='bg-game-blue border-b-[3px] border-game-blue-border text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition cursor-pointer'
          >
            <i className="fa-solid fa-download text-xs" />
            Download template file
          </button>
        </div>

        {/* Upload area */}
        <div
          className='bg-white rounded-xl border border-border p-5 flex gap-4 cursor-pointer hover:border-game-blue/40 transition-colors'
          onClick={() => fileInputRef.current.click()}
        >
          <div className='w-[90px] h-[90px] rounded-xl bg-game-blue-soft flex justify-center items-center shrink-0'>
            <i className="fa-solid fa-upload text-game-blue text-3xl" />
          </div>
          <div className='flex flex-col justify-center gap-1'>
            <h2 className='font-bold text-lg text-text-primary'>Upload Dataset</h2>
            <p className='text-text-secondary text-sm'>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected: ${selectedFiles.map(f => f.name).join(', ')}`
                : 'Upload your dataset in CSV format to visualize and analyze it on the map.'
              }
            </p>
            <p className='text-text-secondary text-xs'>Accepted file type: CSV</p>
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" multiple className='hidden' />

        {/* Preview */}
        {uploadedRecords.length > 0 && (
          <>
            <div className='bg-white rounded-xl border border-border p-5'>
              <h2 className='text-sm font-bold text-text-primary mb-3'>Imported Data Preview</h2>
              <div className="relative overflow-x-auto rounded-xl">
                <PreviewTable uploadedRecords={uploadedRecords} />
              </div>
            </div>
            <div className='flex justify-end'>
              <button
                className='bg-game-green border-b-[3px] border-game-green-border text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition cursor-pointer'
                onClick={handleStoreData}
              >
                Import Dataset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
