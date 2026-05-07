import React, { useState, useRef, useEffect } from 'react';
import { overviewService } from '../../../../services/overviewService';

export default function NatureElement({ formData, setFormData, onSubmit, onCancel, loading }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [elementTypes, setElementTypes] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    overviewService.getElementTypes()
      .then(setElementTypes)
      .catch(() => {});
  }, []);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className='flex flex-col gap-3 h-full w-full'>
        {selectedImage ? (
          <img src={selectedImage} alt="Uploaded" className='w-full h-[120px] object-cover rounded' />
        ) : (
          <div className='w-full h-[120px] bg-gray-500 flex items-center justify-center cursor-pointer' onClick={handleDivClick}>
              <p className='italic text-white text-sm'>Click to upload image</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div className='grow-1 flex gap-3 py-0 px-4'>
            <div className='flex-col gap-3 flex-1'>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Element name</p>
                <input
                  type="text"
                  value={formData.elementName}
                  onChange={(e) => setFormData({...formData, elementName: e.target.value})}
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm'
                />
              </div>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Element type</p>
                <select
                  value={formData.elementType}
                  onChange={(e) => setFormData({...formData, elementType: e.target.value})}
                  className='w-full h-6 border border-gray-300 rounded px-1 text-sm bg-white'
                >
                  <option value=''>Select a type...</option>
                  {elementTypes.map((et) => (
                    <option key={et.id} value={et.name}>{et.name}</option>
                  ))}
                </select>
              </div>
              <div className='mt-2 flex items-center gap-2'>
                <input
                  type="checkbox"
                  id="isGreen"
                  checked={formData.isGreen}
                  onChange={(e) => setFormData({...formData, isGreen: e.target.checked})}
                />
                <label htmlFor="isGreen" className='font text-sm text-gray-500'>Is Green</label>
              </div>
            </div>
            <div className='flex-col gap-3 flex-1'>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Latitude</p>
                <input
                  type="text"
                  placeholder='-79.3832'
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm'
                />
              </div>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Longitude</p>
                <input
                  type="text"
                  value={formData.latitude}
                  placeholder='43.6532'
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm'
                />
              </div>
            </div>
        </div>
        <i className="text-gray-500 text-center px-3 text-sm">
            Click on the map to automatically fill the latitude and longitude fields.
        </i>
        <div className='flex items-center justify-evenly pb-4 px-4 gap-3'>
            <button
              onClick={onSubmit}
              disabled={loading}
              className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer disabled:opacity-50'
            >
                {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer'
            >
                Cancel
            </button>
        </div>
    </div>
  )
}
