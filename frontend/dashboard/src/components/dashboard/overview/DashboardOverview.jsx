    import { useState, useMemo, useEffect, useCallback } from "react";
    import Map from "./Map";
    import Chart from "./Chart";
    import DashboardNavBar from "../DashboardNavBar";
    import { useOverviewData } from "../../../hooks/useOverviewData";
    import { overviewService } from "../../../services/overviewService";
    import ManageElement from "./ManageElement";
    import ElementDetails from "./ElementDetails";
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
            if (isModalOpen) setSelectedElement(null);
        }, [isModalOpen]);

        // Selecting an element closes the add modal
        useEffect(() => {
            if (selectedElement) setIsModalOpen(false);
        }, [selectedElement]);

        const handleCheckpointClick = useCallback((cp) => {
            if (cp.type === 'element') {
                const el = elements.find(e => e.id === cp.referenceId);
                if (el) setSelectedElement(el);
            }
        }, [elements]);

        const handleOnExtentClick = () => {
            setIsModalOpen(false);
            setSelectedElement(null);
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
                const label = e.elementType?.name ?? `Type ${e.elementTypeId}`;
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

        const soilStatus = (pct) => {
            if (pct == null) return null;
            if (pct < 25) return { label: "Dry",       text: "text-orange-600", bg: "bg-orange-50 border-orange-200" };
            if (pct < 60) return { label: "Optimal",   text: "text-green-600",  bg: "bg-green-50 border-green-200"   };
            if (pct < 80) return { label: "Moist",     text: "text-blue-600",   bg: "bg-blue-50 border-blue-200"     };
            return           { label: "Saturated", text: "text-purple-600", bg: "bg-purple-50 border-purple-200" };
        };

        const canopyData = useMemo(() => {
            const trees = elements.filter((e) => e.elementType?.id === TREE_TYPE_ID).length;
            return [
                { name: "Canopy", value: trees },
                { name: "Other", value: elements.length - trees },
            ];
        }, [elements]);

        const canopyPercent = elements.length
            ? Math.round((elements.filter((e) => e.elementType?.id === TREE_TYPE_ID).length / elements.length) * 100)
            : 0;

        const sidePanel = isModalOpen ? 'add' : selectedElement ? 'element' : null;

      return (
  <div className="flex flex-col min-h-screen h-full relative overflow-hidden">
    {isLoading && <Loading />}

    <DashboardNavBar title="Arboretum Overview" />

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

      {!loading && !error && sensors.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Sensors</h2>
              <p className="text-sm text-gray-500">{sensors.length} sensor{sensors.length !== 1 ? "s" : ""} · latest readings</p>
            </div>
            <button
              onClick={() => setSelectedItem("Sensor Management")}
              className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              Manage <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {sensors.map((sensor) => {
              const soil = soilStatus(sensor.soilMoisture);
              const hasReading = sensor.temp != null || sensor.humidity != null;
              return (
                <div key={sensor.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-wifi text-indigo-500 text-xs" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{sensor.sensorName}</p>
                        <p className="text-xs text-gray-400">ID #{sensor.id}</p>
                      </div>
                    </div>
                    {sensor.lastReading ? (
                      <span className="text-xs text-gray-400">
                        {new Date(sensor.lastReading).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 italic">No data</span>
                    )}
                  </div>

                  {hasReading ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="font-bold text-red-600 text-sm">{sensor.temp != null ? `${sensor.temp} °C` : "—"}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Humidity</p>
                        <p className="font-bold text-blue-600 text-sm">{sensor.humidity != null ? `${sensor.humidity} %` : "—"}</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Light</p>
                        <p className="font-bold text-yellow-600 text-sm">{sensor.light != null ? `${sensor.light} lux` : "—"}</p>
                      </div>
                      <div className={`border rounded-lg p-2 text-center ${soil ? soil.bg : "bg-green-50 border-green-200"}`}>
                        <p className="text-xs text-gray-500">Soil Moisture</p>
                        <p className={`font-bold text-sm ${soil ? soil.text : "text-green-600"}`}>
                          {sensor.soilMoisture != null ? `${sensor.soilMoisture} %` : "—"}
                          {soil && <span className="ml-1 text-xs font-normal opacity-70">· {soil.label}</span>}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-center text-xs text-gray-400 italic">
                      Awaiting first reading
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);
    }
