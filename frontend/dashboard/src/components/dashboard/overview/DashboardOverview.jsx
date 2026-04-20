import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Map from "./Map";
import Chart from "./Chart";
import ElementDetail from "./ElementDetail";
import DashboardNavBar from "../DashboardNavBar";
import { useOverviewData } from "../../../hooks/useOverviewData";

// Maps the numeric elementType ID stored in the database to a human-readable label.
// These IDs come from the CSV dataset import — update this map if your data uses
// different IDs.
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

// Tree type ID — used to calculate canopy coverage.
const TREE_TYPE_ID = 1;

export default function DashboardOverview({ setSelectedItem }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch sensors + elements from GET /api/dashboard/overview
    const { data, loading, error } = useOverviewData();

    const elements = data?.element ?? [];
    const sensors = data?.sensors ?? [];

    // --- Chart 1: Green vs Non-Green ---
    // Counts how many elements have isGreen = true vs false
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

    // --- Chart 2: Element Types breakdown ---
    // Groups elements by their type and counts each group
    const elementTypesData = useMemo(() => {
        const counts = {};
        elements.forEach((e) => {
            const label = ELEMENT_TYPE_LABELS[e.elementType] ?? `Type ${e.elementType}`;
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [elements]);

    // --- Chart 3: Sensor readings (temp + humidity per sensor) ---
    // Each bar group = one sensor, showing its temperature and humidity side by side
    const sensorChartData = useMemo(
        () => sensors.map((s) => ({ name: `S${s.id}`, temp: s.temp, humidity: s.humidity, light: s.light })),
        [sensors]
    );

    const sensorBars = [
        { dataKey: "temp",     color: "#ef4444", name: "Temp °C"    },
        { dataKey: "humidity", color: "#3b82f6", name: "Humidity %" },
        { dataKey: "light",    color: "#f59e0b", name: "Light lux"  },
    ];

    // --- Chart 4: Canopy coverage ---
    // Canopy = elements with elementType matching Tree (ID 1)
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

    return (
        <div className="flex flex-col h-full">
            <DashboardNavBar title="Alboretum Overview" />
            <div className="p-[20px] flex flex-col gap-5 h-full">
                <div className="w-full h-[375px] flex items-center justify-center gap-3">
                    <Map showExtent={isModalOpen} setShowExtent={setIsModalOpen} />
                    {isModalOpen && <ElementDetail />}
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
                        {/* Chart 1: What % of elements are green plants vs hard surfaces */}
                        <Chart
                            color="border-secondary-green"
                            type="pie"
                            title="Green vs Non-Green"
                            value={`${greenPercent}% Green`}
                            data={greenChartData}
                        />

                        {/* Chart 2: How many of each landscape element type exist */}
                        <Chart
                            color="border-blue-500"
                            type="bar"
                            title="Element Types"
                            value={`${elements.length} Elements`}
                            data={elementTypesData}
                            bars={[{ dataKey: "value", color: "#3b82f6", name: "Count" }]}
                        />

                        {/* Chart 3: Live sensor readings — temperature and humidity per sensor */}
                        <Chart
                            color="border-yellow-500"
                            type="bar"
                            title="Sensor Readings"
                            value={`${sensors.length} Sensors`}
                            data={sensorChartData}
                            bars={sensorBars}
                        />

                        {/* Chart 4: What % of elements are tree canopy */}
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
