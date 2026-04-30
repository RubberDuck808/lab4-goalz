export default function Sensor({ formData, setFormData, onSubmit, onCancel, loading }) {
  return (
    <div className='flex flex-col gap-3 h-full w-full'>
        <div className='grow-1 flex flex-col gap-3 py-0 px-4 mt-4'>
            <div>
                <p className='font text-sm text-gray-500'>Sensor name</p>
                <input
                    type="text"
                    value={formData.sensorName}
                    onChange={(e) => setFormData({...formData, sensorName: e.target.value})}
                    className='w-full h-8 border border-gray-300 rounded px-2 text-sm'
                    placeholder='e.g. Sensor A1'
                />
            </div>
            <div className='flex gap-3'>
                <div className='flex-1'>
                    <p className='font text-sm text-gray-500'>Latitude</p>
                    <input
                        type="text"
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                        className='w-full h-8 border border-gray-300 rounded px-2 text-sm'
                    />
                </div>
                <div className='flex-1'>
                    <p className='font text-sm text-gray-500'>Longitude</p>
                    <input
                        type="text"
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                        className='w-full h-8 border border-gray-300 rounded px-2 text-sm'
                    />
                </div>
            </div>
        </div>
        <i className="text-gray-500 text-center px-3 text-sm">
            Click on the map to automatically fill the latitude and longitude fields.
        </i>
        <div className='flex items-center justify-evenly pb-4 px-4 gap-3 mt-4'>
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
