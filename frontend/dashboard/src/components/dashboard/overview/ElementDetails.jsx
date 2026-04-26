import React from 'react'
import { overviewService } from '../../../services/overviewService'

export default function ElementDetails({ element, onElementSaved, onElementDeleted }) {
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [editedElement, setEditedElement] = React.useState(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState('');
    const [elementTypes, setElementTypes] = React.useState([]);
    const [previewImage, setPreviewImage] = React.useState(null);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        overviewService.getElementTypes()
            .then(setElementTypes)
            .catch(() => {});
    }, []);

    React.useEffect(() => {
        if (!element) { setEditedElement(null); return; }
        setEditedElement({
            ...element,
            geom: {
                ...element.geom,
                coordinates: element.geom?.coordinates ? [...element.geom.coordinates] : [0, 0],
            },
        });
        setPreviewImage(null);
    }, [element]);

    const handleOpenEdit = () => { setError(''); setOpenEditModal(true); };

    const handleCancelEdit = () => {
        setError('');
        setOpenEditModal(false);
        setPreviewImage(null);
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
        setEditedElement((prev) => ({ ...prev, [field]: value }));
    };

    const handleCoordinateChange = (index, value) => {
        setEditedElement((prev) => {
            const coordinates = [...(prev.geom?.coordinates || [0, 0])];
            coordinates[index] = value === '' ? '' : Number(value);
            return { ...prev, geom: { ...prev.geom, coordinates } };
        });
    };

    const handleImageClick = () => { if (openEditModal) fileInputRef.current?.click(); };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
            handleFieldChange('imageUrl', url);
        }
    };

    const handleSave = async () => {
        if (!editedElement) return;
        setIsSaving(true);
        setError('');
        try {
            await overviewService.updateElement(editedElement.id, {
                elementName: editedElement.elementName,
                elementType: editedElement.elementType?.name ?? String(editedElement.elementType ?? ''),
                longitude: Number(editedElement.geom?.coordinates?.[0] ?? 0),
                latitude: Number(editedElement.geom?.coordinates?.[1] ?? 0),
                imageUrl: editedElement.imageUrl ?? null,
                isGreen: !!editedElement.isGreen,
            });
            setOpenEditModal(false);
            setPreviewImage(null);
            if (onElementSaved) onElementSaved();
        } catch (saveError) {
            console.error(saveError);
            setError('Unable to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!element || !window.confirm(`Delete element "${element.elementName}"?`)) return;
        setIsDeleting(true);
        setError('');
        try {
            await overviewService.deleteElement(element.id);
            if (onElementDeleted) onElementDeleted();
        } catch (deleteError) {
            console.error(deleteError);
            setError('Unable to delete element. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!element) {
        return (
            <div className='h-full w-[500px] bg-white rounded-lg shadow flex items-center justify-center'>
                <p className='text-gray-500'>Select an element to see details.</p>
            </div>
        );
    }

    const displayImage = previewImage || element.imageUrl;

    return (
        <div className='h-full w-[500px] bg-white rounded-lg shadow flex flex-col overflow-hidden'>
            <div className='grow-1 w-full overflow-auto flex flex-col'>
                {/* Image area — clickable in edit mode */}
                <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />
                {displayImage ? (
                    <div className='relative w-full h-[120px]' onClick={handleImageClick}
                        style={{ cursor: openEditModal ? 'pointer' : 'default' }}>
                        <img src={displayImage} alt='Element' className='w-full h-[120px] object-cover rounded' />
                        {openEditModal && (
                            <div className='absolute inset-0 bg-black/40 flex items-center justify-center rounded'>
                                <p className='italic text-white text-sm'>Click to change image</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className='w-full h-[120px] bg-gray-500 flex items-center justify-center rounded'
                        onClick={handleImageClick}
                        style={{ cursor: openEditModal ? 'pointer' : 'default' }}
                    >
                        <p className='italic text-white text-sm'>
                            {openEditModal ? 'Click to upload image' : 'No image available'}
                        </p>
                    </div>
                )}

                <div className='grow-1 flex gap-3 py-0 px-4 mt-4'>
                    <div className='flex-col gap-3 grow-1'>
                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Element name</p>
                            {openEditModal ? (
                                <input
                                    value={editedElement?.elementName ?? ''}
                                    onChange={(e) => handleFieldChange('elementName', e.target.value)}
                                    className='w-full rounded border border-gray-300 p-1 text-sm'
                                />
                            ) : (
                                <p>{element.elementName || 'N/A'}</p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Element type</p>
                            {openEditModal ? (
                                <select
                                    value={editedElement?.elementType?.id ?? editedElement?.elementType ?? ''}
                                    onChange={(e) => {
                                        const selected = elementTypes.find((t) => String(t.id) === e.target.value);
                                        handleFieldChange('elementType', selected ?? e.target.value);
                                    }}
                                    className='w-full rounded border border-gray-300 p-1 text-sm bg-white'
                                >
                                    <option value=''>Select a type...</option>
                                    {elementTypes.map((et) => (
                                        <option key={et.id} value={et.id}>{et.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p>{element.elementType?.name || element.elementType || 'N/A'}</p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Green element</p>
                            {openEditModal ? (
                                <label className='inline-flex items-center gap-2 text-sm cursor-pointer'>
                                    <input
                                        type='checkbox'
                                        checked={!!editedElement?.isGreen}
                                        onChange={(e) => handleFieldChange('isGreen', e.target.checked)}
                                        className='h-4 w-4'
                                    />
                                    Yes
                                </label>
                            ) : (
                                <p>{element.isGreen ? 'Yes' : 'No'}</p>
                            )}
                        </div>
                    </div>

                    <div className='flex-col gap-3 grow-1'>
                        <div className='mt-2'>
                            <p className='font text-sm text-gray-500'>Longitude</p>
                            {openEditModal ? (
                                <input
                                    type='text'
                                    value={editedElement?.geom?.coordinates?.[0] ?? ''}
                                    onChange={(e) => handleCoordinateChange(0, e.target.value)}
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
                                    value={editedElement?.geom?.coordinates?.[1] ?? ''}
                                    onChange={(e) => handleCoordinateChange(1, e.target.value)}
                                    className='w-full rounded border border-gray-300 p-1 text-sm'
                                />
                            ) : (
                                <p>{element.geom?.coordinates?.[1] ?? 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {error && <div className='px-4 mt-2 text-sm text-red-600'>{error}</div>}

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
        </div>
    );
}
