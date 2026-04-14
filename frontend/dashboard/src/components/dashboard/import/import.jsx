import React, { useState, useRef } from 'react'
import DashboardNavBar from '../DashboardNavBar'

export default function ImportData() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };
  return (
    <div className='flex flex-col'>
        <DashboardNavBar title="Import Dataset" />
        <div className='flex flex-col w-full grow-1 p-4 gap-5'>
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
                selectedFiles.length > 0 && (
                    <>
                        <div className='bg-white rounded w-full p-5 border border-gray-300 rounded-lg shadow mt-4'>
                            <h2 className='text-xl font-bold text-gray-800 mb-4'>Imported Data Preview</h2>
                            <div className="relative overflow-x-auto shadow-md rounded-lg mt-2">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-semibold">
                                                Nature element
                                            </th>
                                            <th scope="col" className="px-6 py-3 font-semibold">
                                                Specie
                                            </th>
                                            <th scope="col" className="px-6 py-3 font-semibold">
                                                Health score
                                            </th>
                                            <th scope="col" className="px-6 py-3 font-semibold">
                                                Longitude
                                            </th>
                                            <th scope="col" className="px-6 py-3 font-semibold">
                                                Latitude
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="odd:bg-gray-50 even:bg-white border-b border-gray-200 hover:bg-gray-100 transition-colors">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Oak Tree
                                            </th>
                                            <td className="px-6 py-4 text-gray-600">
                                                Quercus robur
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                85%
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                -79.6099
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                43.7260
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50 even:bg-white border-b border-gray-200 hover:bg-gray-100 transition-colors">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Maple Tree
                                            </th>
                                            <td className="px-6 py-4 text-gray-600">
                                                Acer saccharum
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                92%
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                -79.6105
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                43.7270
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50 even:bg-white border-b border-gray-200 hover:bg-gray-100 transition-colors">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Pine Tree
                                            </th>
                                            <td className="px-6 py-4 text-gray-600">
                                                Pinus sylvestris
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                78%
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                -79.6080
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                43.7280
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 transition-colors">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Birch Tree
                                            </th>
                                            <td className="px-6 py-4 text-gray-600">
                                                Betula pendula
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                88%
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                -79.6075
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                43.7290
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='flex flex-row-reverse'>
                            <button className='bg-secondary-green rounded-lg w-[150px] py-2 text-white cursor-pointer'>
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
