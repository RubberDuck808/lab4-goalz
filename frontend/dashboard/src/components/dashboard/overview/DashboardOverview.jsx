    import { useState, useMemo, useEffect, useCallback } from "react";
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
        const [checkpoints, setCheckpoints] = useState([]);
        const [selectedElement, setSelectedElement] = useState(null);
        const [selectedSensor, setSelectedSensor] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const [coordsPick, setCoordsPick] = useState(null);

        // useOverviewData fetches elements + sensors for charts (and detail panel lookup)
        const { data, loading, error } = useOverviewData();
        const elements = data?.element ?? [];
        const sensors  = data?.sensors ?? [];

        const fetchCheckpoints = useCallback(async () => {
            const cps = await overviewService.getCheckpoints();
            setCheckpoints(Array.isArray(cps) ? cps : []);
            setIsLoading(false);
        }, []);

        useEffect(() => { fetchCheckpoints(); }, [fetchCheckpoints]);

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

        const handleCheckpointClick = useCallback((cp) => {
            if (cp.type === 'element') {
                const el = elements.find(e => e.id === cp.referenceId);
                if (el) { setSelectedSensor(null); setSelectedElement(el); }
            } else if (cp.type === 'sensor') {
                const sensor = sensors.find(s => s.id === cp.referenceId);
                if (sensor) { setSelectedElement(null); setSelectedSensor(sensor); }
            }
        }, [elements, sensors]);

        const handleOnExtentClick = () => {
            setIsModalOpen(false);
            setSelectedElement(null);
            setSelectedSensor(null);
            setCoordsPick(null);
        };

        const handleElementDeleted = () => {
            setSelectedElement(null);
            fetchCheckpoints();
        };

        const handleElementSaved = () => {
            setSelectedElement(null);
            fetchCheckpoints();
        };

        const handleSensorDeleted = () => {
            setSelectedSensor(null);
            fetchCheckpoints();
        };

        const handleSensorSaved = () => {
            setSelectedSensor(null);
            fetchCheckpoints();
        };

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
  <div className="flex flex-col min-h-screen h-full relative overflow-hidden">
    {isLoading && <Loading />}

    <DashboardNavBar title="Alboretum Overview" />

    <div className="p-4 md:p-5 flex flex-col gap-5 flex-1 overflow-y-auto">
      <div className="w-full flex flex-col lg:flex-row items-stretch gap-3">
        <div className="w-full h-[300px] sm:h-[375px] lg:flex-1">
          <Map
            showExtent={!!sidePanel}
            setShowExtent={setIsModalOpen}
            checkpoints={checkpoints}
            onCheckpointClick={handleCheckpointClick}
            closeModal={handleOnExtentClick}
            onCoordsPick={isModalOpen ? (c) => setCoordsPick(c) : null}
            pickedCoords={isModalOpen ? coordsPick : null}
          />
        </div>

        {sidePanel === "add" && (
          <div className="w-full lg:w-[380px]">
            <ManageElement
              coordsPick={coordsPick}
              onCoordsConsumed={() => setCoordsPick(null)}
              onSaved={fetchCheckpoints}
            />
          </div>
        )}

        {sidePanel === "element" && (
          <div className="w-full lg:w-[380px]">
            <ElementDetails
              element={selectedElement}
              onElementSaved={handleElementSaved}
              onElementDeleted={handleElementDeleted}
            />
          </div>
        )}

        {sidePanel === "sensor" && (
          <div className="w-full lg:w-[380px]">
            <SensorDetails
              sensor={selectedSensor}
              onSensorSaved={handleSensorSaved}
              onSensorDeleted={handleSensorDeleted}
            />
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center text-gray-400 text-sm py-10">
          Loading chart data...
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center text-red-400 text-sm py-10">
          Could not load data: {error.message}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="w-full min-h-[300px]">
            <Chart
              color="border-secondary-green"
              type="pie"
              title="Green vs Non-Green"
              value={`${greenPercent}% Green`}
              data={greenChartData}
            />
          </div>

          <div className="w-full min-h-[300px]">
            <Chart
              color="border-blue-500"
              type="bar"
              title="Element Types"
              value={`${elements.length} Elements`}
              data={elementTypesData}
              bars={[{ dataKey: "value", color: "#3b82f6", name: "Count" }]}
            />
          </div>

          <div className="w-full min-h-[300px]">
            <Chart
              color="border-yellow-500"
              type="bar"
              title="Sensor Readings"
              value={`${sensors.length} Sensors`}
              data={sensorChartData}
              bars={sensorBars}
            />
          </div>

          <div className="w-full min-h-[300px]">
            <Chart
              color="border-red-500"
              type="pie"
              title="Canopy Coverage"
              value={`${canopyPercent}% Canopy`}
              data={canopyData}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
    }
