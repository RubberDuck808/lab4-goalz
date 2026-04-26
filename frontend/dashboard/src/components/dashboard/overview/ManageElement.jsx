import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NatureElement from './ElementDetails/NatureElement';
import Sensor from './ElementDetails/Sensor';
import { overviewService } from '../../../services/overviewService';

const defaultElementForm = {
    elementName: '',
    elementType: '',
    longitude: '',
    latitude: '',
    imageUrl: '',
    isGreen: false,
};

const defaultSensorForm = {
    sensorName: '',
    longitude: '',
    latitude: '',
};

export default function ManageElement({ coordsPick, onCoordsConsumed, onSaved }) {
    const [selectedItem, setSelectedItem] = useState("Element");
    const [elementForm, setElementForm] = useState(defaultElementForm);
    const [sensorForm, setSensorForm] = useState(defaultSensorForm);
    const [loading, setLoading] = useState(false);

    // Apply coordinates picked from the map into the active form
    useEffect(() => {
        if (!coordsPick) return;
        const lat = coordsPick.lat.toFixed(6);
        const lng = coordsPick.lng.toFixed(6);
        if (selectedItem === 'Element') {
            setElementForm((f) => ({ ...f, latitude: lat, longitude: lng }));
        } else {
            setSensorForm((f) => ({ ...f, latitude: lat, longitude: lng }));
        }
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

    const handleSaveSensor = async () => {
        setLoading(true);
        try {
            await overviewService.createSensor({
                sensorName: sensorForm.sensorName,
                longitude: parseFloat(sensorForm.longitude),
                latitude: parseFloat(sensorForm.latitude),
            });
            setSensorForm(defaultSensorForm);
            if (onSaved) onSaved();
            toast.success('Sensor created successfully!');
        } catch (e) {
            toast.error(e.message || 'Failed to create sensor.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (selectedItem === "Element") setElementForm(defaultElementForm);
        else setSensorForm(defaultSensorForm);
    };

    return (
        <div className='h-full w-[500px] bg-white rounded-lg shadow flex flex-col overflow-hidden'>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='w-full h-[40px] bg-white flex overflow-hidden rounded-tl-lg rounded-tr-lg'>
                <div
                    className={`flex items-center justify-center grow-1 cursor-pointer ${selectedItem === "Element" ? "bg-secondary-green text-white" : "text-black"}`}
                    onClick={() => setSelectedItem("Element")}
                >
                    <p className='font text-center text-sm font-bold'>Element</p>
                </div>
                <div
                    className={`flex items-center justify-center grow-1 cursor-pointer ${selectedItem === "Sensor" ? "bg-secondary-green text-white" : "text-black"}`}
                    onClick={() => setSelectedItem("Sensor")}
                >
                    <p className='font text-center text-sm font-bold'>Sensor</p>
                </div>
            </div>

            <div className='grow-1 w-full overflow-auto'>
                {selectedItem === "Element" ? (
                    <NatureElement
                        formData={elementForm}
                        setFormData={setElementForm}
                        onSubmit={handleSaveElement}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                ) : (
                    <Sensor
                        formData={sensorForm}
                        setFormData={setSensorForm}
                        onSubmit={handleSaveSensor}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}
