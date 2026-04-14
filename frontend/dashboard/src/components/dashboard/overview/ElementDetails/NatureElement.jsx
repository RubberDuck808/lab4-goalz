import React, { useState, useRef } from 'react'

export default function NatureElement({ formData, setFormData, onSubmit }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

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
        <div className='grow-1 flex flex gap-3 py-0 px-4'>
            <div className='flex-col items-center justify-between gap-3 grow-1'>
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
                <p className='font text-sm text-gray-500'>Element specie</p>
                <input 
                  type="text" 
                  value={formData.elementSpecie} 
                  onChange={(e) => setFormData({...formData, elementSpecie: e.target.value})} 
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm' 
                />
              </div>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Health Score</p>
                <input 
                  type="text" 
                  value={formData.healthScore} 
                  onChange={(e) => setFormData({...formData, healthScore: e.target.value})} 
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm' 
                />
              </div>
            </div>
            <div className='flex-col items-center justify-between gap-3 grow-1'>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Longitude</p>
                <input 
                  type="text" 
                  value={formData.longitude} 
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})} 
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm' 
                />
              </div>
              <div className='mt-2'>
                <p className='font text-sm text-gray-500'>Latitude</p>
                <input 
                  type="text" 
                  value={formData.latitude} 
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})} 
                  className='w-full h-6 border border-gray-300 rounded px-2 text-sm' 
                />
              </div>
            </div>
        </div>
        <div className='flex items-center justify-evenly pb-4 px-4 gap-3'>
            <button onClick={onSubmit} className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer'>
                Save
            </button>
            <button className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer'>
                Cancel
            </button>
        </div>
  </div>
  )
}
