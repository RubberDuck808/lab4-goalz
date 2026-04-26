import React, { useState, useEffect } from 'react'

export default function PreviewTable({ uploadedRecords }) {

    const [records, setRecords] = useState([]);
    useEffect(() => {
        if (uploadedRecords && uploadedRecords.length > 0) {
            const processedRecords = uploadedRecords.map(record => record.split(';'));
            setRecords(processedRecords);
        } else {
            setRecords([]);
        }
    }, [uploadedRecords])

  return (
    <>
      {records.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-48 text-gray-500'>
          <i className="fa-solid fa-table-list text-4xl mb-3"></i>
          <p className='text-lg'>No data to preview. Please upload a CSV file.</p>
        </div>
      ) : (
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              {records && records[0] && records[0].map((col, index) => (
                <th key={index} scope="col" className="px-6 py-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.slice(1).map((record, index) => (
              <tr key={index} className="odd:bg-gray-50 even:bg-white border-b border-gray-200 hover:bg-gray-100 transition-colors">
                {record.map((value, idx) => (
                  <td key={idx} className="px-6 py-4 text-gray-600">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
