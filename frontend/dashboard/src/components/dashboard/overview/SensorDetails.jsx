import React from 'react'
import { overviewService } from '../../../services/overviewService'

export default function SensorDetails({ sensor, onSensorSaved, onSensorDeleted }) {
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [editedSensor, setEditedSensor] = React.useState(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!sensor) { setEditedSensor(null); return; }
        const coords = sensor.geo?.coordinates ?? [0, 0];
        setEditedSensor({
            ...sensor,
            editLongitude: String(coords[0] ?? ''),
            editLatitude: String(coords[1] ?? ''),
        });
    }, [sensor]);

    const handleOpenEdit = () => { setError(''); setOpenEditModal(true); };

    const handleCancelEdit = () => {
        setError('');
        setOpenEditModal(false);
        if (sensor) {
            const coords = sensor.geo?.coordinates ?? [0, 0];
            setEditedSensor({ ...sensor, editLongitude: String(coords[0] ?? ''), editLatitude: String(coords[1] ?? '') });
        }
    };

    const handleSave = async () => {
        if (!editedSensor) return;
        setIsSaving(true);
        setError('');
        try {
            await overviewService.updateSensor(editedSensor.id, {
                sensorName: editedSensor.sensorName,
                longitude: parseFloat(editedSensor.editLongitude),
                latitude: parseFloat(editedSensor.editLatitude),
            });
            setOpenEditModal(false);
            if (onSensorSaved) onSensorSaved();
        } catch (e) {
            console.error(e);
            setError('Unable to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!sensor || !window.confirm(`Delete sensor "${sensor.sensorName}"?`)) return;
        setIsDeleting(true);
        setError('');
        try {
            await overviewService.deleteSensor(sensor.id);
            if (onSensorDeleted) onSensorDeleted();
        } catch (e) {
            console.error(e);
            setError('Unable to delete sensor. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!sensor) {
        return (
            <div className='h-full w-[500px] bg-white rounded-lg shadow flex items-center justify-center'>
                <p className='text-gray-500'>Select a sensor to see details.</p>
            </div>
        );
    }

    const coords = sensor.geo?.coordinates ?? [];

    return (
        <div className='h-full w-[500px] bg-white rounded-lg shadow flex flex-col overflow-hidden'>
            <div className='w-full h-[40px] bg-[#6366f1] flex items-center px-4'>
                <i className='fa-solid fa-wifi text-white mr-2 text-sm' />
                <p className='font text-white text-sm font-bold'>Sensor Details</p>
            </div>

            <div className='grow-1 w-full overflow-auto flex flex-col px-4 mt-4 gap-3'>
                <div>
                    <p className='font text-sm text-gray-500'>Sensor name</p>
                    {openEditModal ? (
                        <input
                            value={editedSensor?.sensorName ?? ''}
                            onChange={(e) => setEditedSensor((p) => ({ ...p, sensorName: e.target.value }))}
                            className='w-full rounded border border-gray-300 p-1 text-sm'
                        />
                    ) : (
                        <p className='font text-sm font-medium'>{sensor.sensorName || 'N/A'}</p>
                    )}
                </div>

                <div className='flex gap-4'>
                    <div className='flex-1'>
                        <p className='font text-sm text-gray-500'>Longitude</p>
                        {openEditModal ? (
                            <input
                                type='text'
                                value={editedSensor?.editLongitude ?? ''}
                                onChange={(e) => setEditedSensor((p) => ({ ...p, editLongitude: e.target.value }))}
                                className='w-full rounded border border-gray-300 p-1 text-sm'
                            />
                        ) : (
                            <p className='font text-sm'>{coords[0] ?? 'N/A'}</p>
                        )}
                    </div>
                    <div className='flex-1'>
                        <p className='font text-sm text-gray-500'>Latitude</p>
                        {openEditModal ? (
                            <input
                                type='text'
                                value={editedSensor?.editLatitude ?? ''}
                                onChange={(e) => setEditedSensor((p) => ({ ...p, editLatitude: e.target.value }))}
                                className='w-full rounded border border-gray-300 p-1 text-sm'
                            />
                        ) : (
                            <p className='font text-sm'>{coords[1] ?? 'N/A'}</p>
                        )}
                    </div>
                </div>

                {/* Sensor readings — view only */}
                <div className='grid grid-cols-3 gap-2 mt-1'>
                    <div className='bg-red-50 border border-red-200 rounded-lg p-2 text-center'>
                        <p className='text-xs text-gray-500'>Temperature</p>
                        <p className='font font-bold text-red-600 text-sm'>{sensor.temp != null ? `${sensor.temp} °C` : 'N/A'}</p>
                    </div>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-2 text-center'>
                        <p className='text-xs text-gray-500'>Humidity</p>
                        <p className='font font-bold text-blue-600 text-sm'>{sensor.humidity != null ? `${sensor.humidity} %` : 'N/A'}</p>
                    </div>
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center'>
                        <p className='text-xs text-gray-500'>Light</p>
                        <p className='font font-bold text-yellow-600 text-sm'>{sensor.light != null ? `${sensor.light} lux` : 'N/A'}</p>
                    </div>
                </div>

                {error && <div className='text-sm text-red-600'>{error}</div>}
            </div>

            <div className='flex items-center justify-evenly pb-4 px-4 gap-3 mt-4'>
                {openEditModal ? (
                    <>
                        <button
                            className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer disabled:opacity-50'
                            onClick={handleSave}
                            disabled={isSaving || isDeleting}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            className='bg-gray-200 rounded py-1 grow-1 text-sm font-bold text-gray-700 cursor-pointer'
                            onClick={handleCancelEdit}
                            disabled={isSaving || isDeleting}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer'
                            onClick={handleOpenEdit}
                        >
                            Edit
                        </button>
                        <button
                            className='bg-red-500 hover:bg-red-600 rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer disabled:opacity-50'
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
