import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Map from "./Map";
import Chart from "./Chart";
import DashboardNavBar from "../DashboardNavBar";
import { useOverviewData } from "../../../hooks/useOverviewData";
import { overviewService } from "../../../services/overviewService";
import ManageElement from "./ManageElement";
import ElementDetails from "./ElementDetails";
import SensorDetails from "./SensorDetails";
import Loading from "../../Loading/Loading";

const ELEMENT_TYPE_LABELS = {
    1: "Tree",
    2: "Shrub",
    3: "Grass/lawn",
    4: "Mulch",
    5: "Garden bed",
    6: "Ground cover",
    7: "Green roof",
    8: "Water body",
};

const TREE_TYPE_ID = 1;

export default function DashboardOverview({ setSelectedItem }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [natureElements, setNatureElements] = useState([]);
    const [sensorsData, setSensorsData] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [coordsPick, setCoordsPick] = useState(null);

    const fetchData = useCallback(async () => {
        const data = await overviewService.getAllElements();
        if (data) {
            setNatureElements(data.element);
            setSensorsData(data.sensors);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Opening the add modal clears any selection
    useEffect(() => {
        if (isModalOpen) {
            setSelectedElement(null);
            setSelectedSensor(null);
        }
    }, [isModalOpen]);

    // Selecting an element or sensor closes the add modal
    useEffect(() => {
        if (selectedElement || selectedSensor) setIsModalOpen(false);
    }, [selectedElement, selectedSensor]);

    const handleOnExtentClick = () => {
        setIsModalOpen(false);
        setSelectedElement(null);
        setSelectedSensor(null);
        setCoordsPick(null);
    };

    const handleElementDeleted = () => {
        setSelectedElement(null);
        fetchData();
    };

    const handleElementSaved = () => {
        setSelectedElement(null);
        fetchData();
    };

    const handleSensorDeleted = () => {
        setSelectedSensor(null);
        fetchData();
    };

    const handleSensorSaved = () => {
        setSelectedSensor(null);
        fetchData();
    };

    const { data, loading, error } = useOverviewData();

    const elements = data?.element ?? [];
    const sensors = data?.sensors ?? [];

    const greenChartData = useMemo(() => {
        const green = elements.filter((e) => e.isGreen).length;
        return [
            { name: "Green", value: green },
            { name: "Non-Green", value: elements.length - green },
        ];
    }, [elements]);

    const greenPercent = elements.length
        ? Math.round((elements.filter((e) => e.isGreen).length / elements.length) * 100)
        : 0;

    const elementTypesData = useMemo(() => {
        const counts = {};
        elements.forEach((e) => {
            const label = ELEMENT_TYPE_LABELS[e.elementType] ?? `Type ${e.elementType}`;
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [elements]);

    const sensorChartData = useMemo(
        () => sensors.map((s) => ({ name: `S${s.id}`, temp: s.temp, humidity: s.humidity, light: s.light })),
        [sensors]
    );

    const sensorBars = [
        { dataKey: "temp",     color: "#ef4444", name: "Temp °C"    },
        { dataKey: "humidity", color: "#3b82f6", name: "Humidity %" },
        { dataKey: "light",    color: "#f59e0b", name: "Light lux"  },
    ];

    const canopyData = useMemo(() => {
        const trees = elements.filter((e) => e.elementType === TREE_TYPE_ID).length;
        return [
            { name: "Canopy", value: trees },
            { name: "Other", value: elements.length - trees },
        ];
    }, [elements]);

    const canopyPercent = elements.length
        ? Math.round((elements.filter((e) => e.elementType === TREE_TYPE_ID).length / elements.length) * 100)
        : 0;

    const sidePanel = isModalOpen ? 'add' : selectedElement ? 'element' : selectedSensor ? 'sensor' : null;

    return (
        <div className="flex flex-col h-full relative">
            {isLoading && <Loading />}
            <DashboardNavBar title="Alboretum Overview" />
            <div className="p-[20px] flex flex-col gap-5 h-full">
                <div className="w-full h-[375px] flex items-center justify-center gap-3">
                    <Map
                        showExtent={!!sidePanel}
                        setShowExtent={setIsModalOpen}
                        elements={natureElements}
                        sensors={sensorsData}
                        closeModal={handleOnExtentClick}
                        setSelectedElement={setSelectedElement}
                        selectedElement={selectedElement}
                        setSelectedSensor={setSelectedSensor}
                        selectedSensor={selectedSensor}
                        onCoordsPick={isModalOpen ? (c) => setCoordsPick(c) : null}
                        pickedCoords={isModalOpen ? coordsPick : null}
                    />
                    {sidePanel === 'add' && (
                        <ManageElement
                            coordsPick={coordsPick}
                            onCoordsConsumed={() => setCoordsPick(null)}
                            onSaved={fetchData}
                        />
                    )}
                    {sidePanel === 'element' && (
                        <ElementDetails
                            element={selectedElement}
                            onElementSaved={handleElementSaved}
                            onElementDeleted={handleElementDeleted}
                        />
                    )}
                    {sidePanel === 'sensor' && (
                        <SensorDetails
                            sensor={selectedSensor}
                            onSensorSaved={handleSensorSaved}
                            onSensorDeleted={handleSensorDeleted}
                        />
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center items-center grow-1 text-gray-400 text-sm">
                        Loading chart data...
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center grow-1 text-red-400 text-sm">
                        Could not load data: {error.message}
                    </div>
                )}

                {!loading && !error && (
                    <div className="flex justify-between gap-3 grow-1">
                        <Chart
                            color="border-secondary-green"
                            type="pie"
                            title="Green vs Non-Green"
                            value={`${greenPercent}% Green`}
                            data={greenChartData}
                        />
                        <Chart
                            color="border-blue-500"
                            type="bar"
                            title="Element Types"
                            value={`${elements.length} Elements`}
                            data={elementTypesData}
                            bars={[{ dataKey: "value", color: "#3b82f6", name: "Count" }]}
                        />
                        <Chart
                            color="border-yellow-500"
                            type="bar"
                            title="Sensor Readings"
                            value={`${sensors.length} Sensors`}
                            data={sensorChartData}
                            bars={sensorBars}
                        />
                        <Chart
                            color="border-red-500"
                            type="pie"
                            title="Canopy Coverage"
                            value={`${canopyPercent}% Canopy`}
                            data={canopyData}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
