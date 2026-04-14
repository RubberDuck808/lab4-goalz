import React, { useState } from 'react';
import NatureElement from './ElementDetails/NatureElement';
import Sensor from './ElementDetails/Sensor';

export default function ElementDetail() {
    const [selectedItem, setSelectedItem] = useState("Element");
    const [formData, setFormData] = useState({
        elementName: '',
        elementSpecie: '',
        healthScore: '',
        sensorId: '',
        sensorType: '',
        longitude: '',
        latitude: ''
    });

    const handleSave = () => {
        // Here you would typically send formData to your backend API
        console.log("Saving data:", formData);
    };

    const renderContent = () => {
        switch (selectedItem) {
            case "Element":
                return <NatureElement formData={formData} setFormData={setFormData} onSubmit={handleSave} />;
            case "Sensor":
                return <Sensor formData={formData} setFormData={setFormData} onSubmit={handleSave} />;
            default:
                return <NatureElement formData={formData} setFormData={setFormData} onSubmit={handleSave} />;
        }
    };

  return (
    <div className='h-full w-[500px] bg-white rounded-lg shadow flex flex-col overflow-hidden'>
        <div className='w-full h-[40px] bg-white flex overflow-hidden rounded-tl-lg rounded-tr-lg'>
            <div className={`flex items-center justify-center grow-1 cursor-pointer ${selectedItem === "Element" ? "bg-secondary-green text-white" : "text-black"}`} onClick={() => setSelectedItem("Element")}>
                <p className='font text-center text-sm font-bold'>
                    Element
                </p>
            </div>
             <div className={`flex items-center justify-center grow-1 cursor-pointer ${selectedItem === "Sensor" ? "bg-secondary-green text-white" : "text-black"}`} onClick={() => setSelectedItem("Sensor")}>
                <p className='font text-center text-sm font-bold'>
                    Sensor
                </p>
            </div>
        </div>
        <div className='grow-1 w-full overflow-auto'>
           {renderContent()}
        </div>
    </div>
  )
}
