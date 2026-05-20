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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const inputCls = 'w-full h-9 border border-border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30 bg-white';

  return (
    <div className='flex flex-col gap-3 w-full'>
      {/* Image upload */}
      {selectedImage ? (
        <img src={selectedImage} alt="Uploaded" className='w-full h-[120px] object-cover' />
      ) : (
        <div
          className='w-full h-[120px] bg-game-blue-soft flex flex-col items-center justify-center cursor-pointer gap-1'
          onClick={() => fileInputRef.current.click()}
        >
          <i className="fa-solid fa-image text-game-blue text-2xl" />
          <p className='text-game-blue text-xs font-semibold'>Click to upload image</p>
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className='hidden' />

      <div className='flex gap-3 px-4'>
        <div className='flex-1 flex flex-col gap-3'>
          <div>
            <p className='text-xs text-text-secondary mb-1'>Element name</p>
            <input
              type="text"
              value={formData.elementName}
              onChange={(e) => setFormData({ ...formData, elementName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <p className='text-xs text-text-secondary mb-1'>Element type</p>
            <select
              value={formData.elementType}
              onChange={(e) => setFormData({ ...formData, elementType: e.target.value })}
              className={inputCls}
            >
              <option value=''>Select a type…</option>
              {elementTypes.map((et) => (
                <option key={et.id} value={et.name}>{et.name}</option>
              ))}
            </select>
          </div>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type="checkbox"
              id="isGreen"
              checked={formData.isGreen}
              onChange={(e) => setFormData({ ...formData, isGreen: e.target.checked })}
              className='h-4 w-4 accent-game-green'
            />
            <span className='text-sm text-text-secondary'>Is Green</span>
          </label>
        </div>

        <div className='flex-1 flex flex-col gap-3'>
          <div>
            <p className='text-xs text-text-secondary mb-1'>Latitude</p>
            <input
              type="text"
              placeholder='43.7260'
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <p className='text-xs text-text-secondary mb-1'>Longitude</p>
            <input
              type="text"
              placeholder='-79.6099'
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <p className='text-xs text-text-secondary italic text-center px-4'>
        Click on the map to automatically fill coordinates.
      </p>

      <div className='flex items-center gap-2 pb-4 px-4'>
        <button
          onClick={onSubmit}
          disabled={loading}
          className='bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold px-3 py-2 rounded-xl flex-1 disabled:opacity-50'
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className='bg-surface border border-border text-text-primary text-sm font-bold px-3 py-2 rounded-xl flex-1'
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
