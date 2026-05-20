import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NatureElement from './ElementDetails/NatureElement';
import { overviewService } from '../../../services/overviewService';

const defaultElementForm = {
    elementName: '',
    elementType: '',
    longitude: '',
    latitude: '',
    imageUrl: '',
    isGreen: false,
};

export default function ManageElement({ coordsPick, onCoordsConsumed, onSaved, onCancel }) {
    const [elementForm, setElementForm] = useState(defaultElementForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!coordsPick) return;
        const lat = coordsPick.lat.toFixed(6);
        const lng = coordsPick.lng.toFixed(6);
        setElementForm((f) => ({ ...f, latitude: lat, longitude: lng }));
    }, [coordsPick]);

    const handleSaveElement = async () => {
        setLoading(true);
        try {
            await overviewService.createElement({
                elementName: elementForm.elementName,
                elementType: elementForm.elementType,
                longitude: parseFloat(elementForm.longitude),
                latitude: parseFloat(elementForm.latitude),
                imageUrl: elementForm.imageUrl || null,
                isGreen: elementForm.isGreen,
            });
            setElementForm(defaultElementForm);
            if (onSaved) onSaved();
            toast.success('Element created successfully!');
        } catch (e) {
            toast.error(e.message || 'Failed to create element.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setElementForm(defaultElementForm);
        if (onCancel) onCancel();
    };

    return (
        <div className='bg-white rounded-xl border border-border flex flex-col overflow-hidden'>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='w-full h-10 bg-game-green flex items-center px-4'>
                <i className="fa-solid fa-leaf text-white mr-2 text-xs" />
                <p className='text-white text-xs font-bold'>Add Element</p>
            </div>
            <div className='w-full overflow-auto'>
                <NatureElement
                    formData={elementForm}
                    setFormData={setElementForm}
                    onSubmit={handleSaveElement}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </div>
        </div>
    );
}
