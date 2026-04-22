import React from 'react'
import { overviewService } from '../../../services/overviewService'

export default function ElementDetails({ element, onElementSaved }) {
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [editedElement, setEditedElement] = React.useState(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!element) {
            setEditedElement(null);
            return;
        }

        setEditedElement({
            ...element,
            geom: {
                ...element.geom,
                coordinates: element.geom?.coordinates ? [...element.geom.coordinates] : [0, 0],
            },
        });
    }, [element]);

    const handleOpenEdit = () => {
        setError('');
        setOpenEditModal(true);
    };

    const handleCancelEdit = () => {
        setError('');
        setOpenEditModal(false);
        if (element) {
            setEditedElement({
                ...element,
                geom: {
                    ...element.geom,
                    coordinates: element.geom?.coordinates ? [...element.geom.coordinates] : [0, 0],
                },
            });
        }
    };

    const handleFieldChange = (field, value) => {
        setEditedElement(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCoordinateChange = (index, value) => {
        setEditedElement(prev => {
            const coordinates = [...(prev.geom?.coordinates || [0, 0])];
            coordinates[index] = value === '' ? '' : Number(value);
            return {
                ...prev,
                geom: {
                    ...prev.geom,
                    coordinates,
                },
            };
        });
    };

    const handleSave = async () => {
        if (!editedElement) return;

        setIsSaving(true);
        setError('');

        try {
            const updated = await overviewService.updateElement(editedElement.id, editedElement);
            setOpenEditModal(false);
            if (onElementSaved) {
                onElementSaved(updated);
            }
        } catch (saveError) {
            console.error(saveError);
            setError('Unable to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!element) {
        return (
            <div className='h-full w-[500px] bg-white rounded-lg shadow flex items-center justify-center'>
                <p className='text-gray-500'>Select an element to see details.</p>
            </div>
        );
    }

    return (
        <div className='h-full w-[500px] bg-white rounded-lg shadow flex flex-col overflow-hidden'>
            <div className='grow-1 w-full overflow-auto flex flex-col'>
                {element.imageUrl ? (
                    <img src={element.imageUrl} alt='Uploaded' className='w-full h-[120px] object-cover rounded' />
                ) : (
                    <div className='w-full h-[120px] bg-gray-500 flex items-center justify-center'>
                        <p className='italic text-white text-sm'>No image available</p>
                    </div>
                )}

                <div className='grow-1 flex flex gap-3 py-0 px-4 mt-4'>
                    <div className='flex-col items-center justify-between gap-3 grow-1'>
                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Element name</p>
                            {openEditModal ? (
                                <input
                                    value={editedElement?.elementName ?? ''}
                                    onChange={e => handleFieldChange('elementName', e.target.value)}
                                    className='w-full rounded border border-gray-300 p-1 text-sm'
                                />
                            ) : (
                                <p>{element.elementName || 'N/A'}</p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Element specie</p>
                            {openEditModal ? (
                                <input
                                    value={editedElement?.elementType.name ?? ''}
                                    onChange={e => handleFieldChange('elementType', e.target.value)}
                                    className='w-full rounded border border-gray-300 p-1 text-sm'
                                />
                            ) : (
                                <p>{element.elementType?.name || 'N/A'}</p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Green element</p>
                            {openEditModal ? (
                                <label className='inline-flex items-center gap-2 text-sm'>
                                    <input
                                        type='checkbox'
                                        checked={!!editedElement?.greenElement}
                                        onChange={e => handleFieldChange('greenElement', e.target.checked)}
                                        className='h-4 w-4'
                                    />
                                    Yes
                                </label>
                            ) : (
                                <p>{element.greenElement ? 'Yes' : 'No'}</p>
                            )}
                        </div>
                    </div>

                    <div className='flex-col items-center justify-between gap-3 grow-1'>
                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Longitude</p>
                            {openEditModal ? (
                                <input
                                    type='text'
                                    step='0.000001'
                                    value={editedElement?.geom?.coordinates?.[0] ?? ''}
                                    onChange={e => handleCoordinateChange(0, e.target.value)}
                                    className='w-full rounded border border-gray-300 p-1 text-sm'
                                />
                            ) : (
                                <p>{element.geom?.coordinates?.[0] ?? 'N/A'}</p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Latitude</p>
                            {openEditModal ? (
                                <input
                                    type='text'
                                    step='0.000001'
                                    value={editedElement?.geom?.coordinates?.[1] ?? ''}
                                    onChange={e => handleCoordinateChange(1, e.target.value)}
                                    className='w-full rounded border border-gray-300 p-1 text-sm'
                                />
                            ) : (
                                <p>{element.geom?.coordinates?.[1] ?? 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {error && <div className='px-4 text-sm text-red-600'>{error}</div>}

                <div className='flex items-center justify-evenly pb-4 px-4 gap-3'>
                    {openEditModal ? (
                        <>
                            <button
                                className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer disabled:opacity-50'
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                className='bg-gray-200 rounded py-1 grow-1 text-sm font-bold text-gray-700 cursor-pointer'
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className='bg-secondary-green rounded py-1 grow-1 text-white text-sm font-bold cursor-pointer'
                            onClick={handleOpenEdit}
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
