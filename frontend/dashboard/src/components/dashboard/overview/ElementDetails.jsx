import React from 'react'
import { overviewService } from '../../../services/overviewService'

const inputCls = 'w-full border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30 bg-white';

export default function ElementDetails({
    element,
    onElementSaved,
    onElementDeleted,
    pickedCoords,
    onCoordsConsumed,
    onEnableCoordPick,
    onDisableCoordPick
}) {
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

    React.useEffect(() => {
        if (openEditModal) {
            onEnableCoordPick?.();
        } else {
            onDisableCoordPick?.();
        }
        return () => {
            onDisableCoordPick?.();
        };
    }, [openEditModal, onEnableCoordPick, onDisableCoordPick]);

    React.useEffect(() => {
        if (openEditModal && pickedCoords) {
            setEditedElement((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    geom: {
                        ...prev.geom,
                        coordinates: [pickedCoords.lng, pickedCoords.lat]
                    }
                };
            });
            onCoordsConsumed?.();
        }
    }, [pickedCoords, openEditModal, onCoordsConsumed]);

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
            <div className='bg-white rounded-xl border border-border flex items-center justify-center py-12'>
                <p className='text-text-secondary text-sm'>Select an element to see details.</p>
            </div>
        );
    }

    const displayImage = previewImage || element.imageUrl;

    return (
        <div className='bg-white rounded-xl border border-border flex flex-col overflow-hidden'>
            <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />

            {/* Image */}
            {displayImage ? (
                <div className='relative w-full h-[120px]' onClick={handleImageClick}
                    style={{ cursor: openEditModal ? 'pointer' : 'default' }}>
                    <img src={displayImage} alt='Element' className='w-full h-[120px] object-cover' />
                    {openEditModal && (
                        <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                            <p className='italic text-white text-sm'>Click to change image</p>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className='w-full h-[120px] bg-game-blue-soft flex flex-col items-center justify-center gap-1'
                    onClick={handleImageClick}
                    style={{ cursor: openEditModal ? 'pointer' : 'default' }}
                >
                    <i className='fa-solid fa-image text-game-blue text-2xl' />
                    <p className='text-game-blue text-xs font-semibold'>
                        {openEditModal ? 'Click to upload image' : 'No image available'}
                    </p>
                </div>
            )}

            <div className='flex gap-3 py-0 px-4 mt-4'>
                <div className='flex-1 flex flex-col gap-3'>
                    <div>
                        <p className='text-xs text-text-secondary mb-1'>Element name</p>
                        {openEditModal ? (
                            <input value={editedElement?.elementName ?? ''} onChange={(e) => handleFieldChange('elementName', e.target.value)} className={inputCls} />
                        ) : (
                            <p className='text-sm text-text-primary font-medium'>{element.elementName || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <p className='text-xs text-text-secondary mb-1'>Element type</p>
                        {openEditModal ? (
                            <select
                                value={editedElement?.elementType?.id ?? editedElement?.elementType ?? ''}
                                onChange={(e) => {
                                    const selected = elementTypes.find((t) => String(t.id) === e.target.value);
                                    handleFieldChange('elementType', selected ?? e.target.value);
                                }}
                                className={inputCls}
                            >
                                <option value=''>Select a type…</option>
                                {elementTypes.map((et) => (
                                    <option key={et.id} value={et.id}>{et.name}</option>
                                ))}
                            </select>
                        ) : (
                            <p className='text-sm text-text-primary'>{element.elementType?.name || element.elementType || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <p className='text-xs text-text-secondary mb-1'>Green element</p>
                        {openEditModal ? (
                            <label className='inline-flex items-center gap-2 text-sm cursor-pointer'>
                                <input type='checkbox' checked={!!editedElement?.isGreen} onChange={(e) => handleFieldChange('isGreen', e.target.checked)} className='h-4 w-4 accent-game-green' />
                                Yes
                            </label>
                        ) : (
                            <p className='text-sm text-text-primary'>{element.isGreen ? 'Yes' : 'No'}</p>
                        )}
                    </div>
                </div>

                <div className='flex-1 flex flex-col gap-3'>
                    <div>
                        <p className='text-xs text-text-secondary mb-1'>Latitude</p>
                        {openEditModal ? (
                            <input type='text' value={editedElement?.geom?.coordinates?.[1] ?? ''} onChange={(e) => handleCoordinateChange(1, e.target.value)} className={inputCls} />
                        ) : (
                            <p className='text-sm text-text-primary'>{element.geom?.coordinates?.[1] ?? 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <p className='text-xs text-text-secondary mb-1'>Longitude</p>
                        {openEditModal ? (
                            <input type='text' value={editedElement?.geom?.coordinates?.[0] ?? ''} onChange={(e) => handleCoordinateChange(0, e.target.value)} className={inputCls} />
                        ) : (
                            <p className='text-sm text-text-primary'>{element.geom?.coordinates?.[0] ?? 'N/A'}</p>
                        )}
                    </div>
                    {openEditModal && (
                        <p className='text-[10px] text-game-blue font-bold mt-1 leading-normal'>
                            <i className="fa-solid fa-map-pin mr-1" />
                            Click map to update location
                        </p>
                    )}
                </div>
            </div>

            {error && <div className='px-4 mt-2 text-sm text-game-red'>{error}</div>}

            <div className='flex items-center gap-2 pb-4 px-4 mt-4'>
                {openEditModal ? (
                    <>
                        <button className='bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold px-3 py-2 rounded-xl flex-1 disabled:opacity-50 cursor-pointer' onClick={handleSave} disabled={isSaving || isDeleting}>
                            {isSaving ? 'Saving…' : 'Save'}
                        </button>
                        <button className='bg-surface border border-border text-text-primary text-sm font-bold px-3 py-2 rounded-xl flex-1 cursor-pointer' onClick={handleCancelEdit} disabled={isSaving || isDeleting}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className='bg-game-blue border-b-[3px] border-game-blue-border text-white text-sm font-bold px-3 py-2 rounded-xl flex-1 cursor-pointer' onClick={handleOpenEdit}>
                            Edit
                        </button>
                        <button className='bg-game-red border-b-[3px] border-game-red-dark text-white text-sm font-bold px-3 py-2 rounded-xl flex-1 disabled:opacity-50 cursor-pointer' onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
