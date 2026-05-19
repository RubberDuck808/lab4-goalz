import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardNavBar from "../DashboardNavBar";
import Map from "../overview/Map";
import { overviewService } from "../../../services/overviewService";
import Loading from "../../Loading/Loading";

const defaultAddForm = { sensorName: "", latitude: "", longitude: "" };

export default function SensorManagement({ setSelectedItem, setBleSelectedSensorId }) {
  const [sensors, setSensors] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [coordsPick, setCoordsPick] = useState(null);
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [locating, setLocating] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, cps] = await Promise.all([
        overviewService.getAllElements(),
        overviewService.getCheckpoints(),
      ]);
      setSensors(overviewData?.sensors ?? []);
      setCheckpoints(Array.isArray(cps) ? cps : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showAddPanel) {
      setEditingId(null);
      setEditForm({});
      setCoordsPick(null);
    }
  }, [showAddPanel]);

  useEffect(() => {
    if (editingId) {
      setShowAddPanel(false);
      setCoordsPick(null);
    }
  }, [editingId]);

  const handleCoordsPick = (c) => {
    setCoordsPick(c);
    if (showAddPanel) {
      setAddForm((f) => ({
        ...f,
        latitude: c.lat.toFixed(6),
        longitude: c.lng.toFixed(6),
      }));
    } else if (editingId) {
      setEditForm((f) => ({
        ...f,
        editLatitude: c.lat.toFixed(6),
        editLongitude: c.lng.toFixed(6),
      }));
    }
  };

  const handleCheckpointClick = (cp) => {
    if (cp.type === "sensor") {
      const sensor = sensors.find((s) => s.id === cp.referenceId);
      if (sensor) startEdit(sensor);
    }
  };

  const handleCloseAll = () => {
    setShowAddPanel(false);
    setEditingId(null);
    setEditForm({});
    setCoordsPick(null);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setFlyTo(loc);
        setLocating(false);
        toast.success("Located! Your position is shown on the map.");
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location — check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddSensor = async () => {
    setAddLoading(true);
    try {
      await overviewService.createSensor({
        sensorName: addForm.sensorName,
        longitude: parseFloat(addForm.longitude),
        latitude: parseFloat(addForm.latitude),
      });
      setAddForm(defaultAddForm);
      setShowAddPanel(false);
      setCoordsPick(null);
      await fetchData();
      toast.success("Sensor created successfully!");
    } catch (e) {
      toast.error(e.message || "Failed to create sensor.");
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (sensor) => {
    const coords = sensor.geo?.coordinates ?? [0, 0];
    setEditingId(sensor.id);
    setEditForm({
      sensorName: sensor.sensorName,
      editLongitude: String(coords[0] ?? ""),
      editLatitude: String(coords[1] ?? ""),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setCoordsPick(null);
  };

  const handleSaveEdit = async (id) => {
    setSavingId(id);
    try {
      await overviewService.updateSensor(id, {
        sensorName: editForm.sensorName,
        longitude: parseFloat(editForm.editLongitude),
        latitude: parseFloat(editForm.editLatitude),
      });
      setEditingId(null);
      setCoordsPick(null);
      await fetchData();
      toast.success("Sensor updated successfully!");
    } catch (e) {
      toast.error(e.message || "Failed to update sensor.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (sensor) => {
    if (!window.confirm(`Delete sensor "${sensor.sensorName}"?`)) return;
    setDeletingId(sensor.id);
    try {
      await overviewService.deleteSensor(sensor.id);
      if (editingId === sensor.id) cancelEdit();
      await fetchData();
      toast.success("Sensor deleted.");
    } catch (e) {
      toast.error(e.message || "Failed to delete sensor.");
    } finally {
      setDeletingId(null);
    }
  };

  const mapPickActive = showAddPanel || !!editingId;

  return (
    <div className="flex flex-col min-h-screen h-full relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoading && <Loading />}

      <DashboardNavBar title="Sensor Management" />

      <div className="p-4 md:p-5 flex flex-col gap-5 flex-1 overflow-y-auto">

        {/* Map + add panel (mirrors overview layout) */}
        <div className="w-full flex flex-col lg:flex-row items-stretch gap-3">
          <div className="w-full h-[300px] sm:h-[375px] lg:flex-1 relative">
            <Map
              showExtent={showAddPanel}
              setShowExtent={(v) => { if (v) setShowAddPanel(true); }}
              checkpoints={checkpoints}
              onCheckpointClick={handleCheckpointClick}
              closeModal={handleCloseAll}
              onCoordsPick={mapPickActive ? handleCoordsPick : null}
              pickedCoords={mapPickActive ? coordsPick : null}
              userLocation={userLocation}
              flyTo={flyTo}
            />
            <button
              onClick={handleLocateMe}
              disabled={locating}
              title="Show my location"
              className="absolute bottom-14 right-3 z-10 w-9 h-9 bg-white border border-gray-300 rounded-lg shadow flex items-center justify-center text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition"
            >
              {locating
                ? <i className="fa-solid fa-spinner fa-spin text-sm" />
                : <i className="fa-solid fa-location-crosshairs text-sm" />}
            </button>
          </div>

          {showAddPanel && (
            <div className="w-full lg:w-[340px] bg-white rounded-lg shadow flex flex-col overflow-hidden shrink-0">
              <div className="w-full h-[40px] bg-[#6366f1] flex items-center px-4">
                <i className="fa-solid fa-plus text-white mr-2 text-sm" />
                <p className="text-white text-sm font-bold">Add New Sensor</p>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <div>
                  <p className="text-sm text-gray-500">Sensor name</p>
                  <input
                    type="text"
                    value={addForm.sensorName}
                    onChange={(e) => setAddForm((f) => ({ ...f, sensorName: e.target.value }))}
                    placeholder="e.g. Sensor A1"
                    className="w-full h-8 border border-gray-300 rounded px-2 text-sm mt-1"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Latitude</p>
                    <input
                      type="text"
                      value={addForm.latitude}
                      onChange={(e) => setAddForm((f) => ({ ...f, latitude: e.target.value }))}
                      className="w-full h-8 border border-gray-300 rounded px-2 text-sm mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Longitude</p>
                    <input
                      type="text"
                      value={addForm.longitude}
                      onChange={(e) => setAddForm((f) => ({ ...f, longitude: e.target.value }))}
                      className="w-full h-8 border border-gray-300 rounded px-2 text-sm mt-1"
                    />
                  </div>
                </div>
                {userLocation && (
                  <button
                    onClick={() => setAddForm((f) => ({
                      ...f,
                      latitude: userLocation.lat.toFixed(6),
                      longitude: userLocation.lng.toFixed(6),
                    }))}
                    className="w-full flex items-center justify-center gap-2 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition"
                  >
                    <i className="fa-solid fa-location-crosshairs text-xs" />
                    Use my location
                  </button>
                )}
                <p className="text-gray-500 text-center text-sm italic">
                  Click on the map to fill coordinates automatically.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddSensor}
                    disabled={addLoading}
                    className="bg-secondary-green text-white text-sm font-bold px-4 py-2 rounded flex-1 disabled:opacity-50"
                  >
                    {addLoading ? "Saving..." : "Save Sensor"}
                  </button>
                  <button
                    onClick={() => { setShowAddPanel(false); setAddForm(defaultAddForm); setCoordsPick(null); }}
                    className="bg-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">All Sensors</h2>
            <p className="text-sm text-gray-500">
              {sensors.length} sensor{sensors.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={() => setShowAddPanel(true)}
            className="bg-secondary-green text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
          >
            <i className="fa-solid fa-plus" />
            Add Sensor
          </button>
        </div>

        {/* Sensor list */}
        <div className="flex flex-col gap-3">
          {!isLoading && sensors.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No sensors found. Add one to get started.
            </div>
          )}

          {sensors.map((sensor) => {
            const coords = sensor.geo?.coordinates ?? [];
            const isEditing = editingId === sensor.id;

            return (
              <div
                key={sensor.id}
                className={`bg-white rounded-lg shadow p-4 flex flex-col gap-3 transition-all ${
                  isEditing ? "ring-2 ring-indigo-400" : ""
                }`}
              >
                {/* Name row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-wifi text-indigo-500 text-sm" />
                    </div>
                    {isEditing ? (
                      <input
                        value={editForm.sensorName}
                        onChange={(e) => setEditForm((f) => ({ ...f, sensorName: e.target.value }))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <div>
                        <p className="font-bold text-sm text-gray-800">{sensor.sensorName}</p>
                        <p className="text-xs text-gray-400">ID #{sensor.id}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(sensor.id)}
                          disabled={savingId === sensor.id}
                          className="bg-secondary-green text-white text-xs font-bold px-3 py-1 rounded disabled:opacity-50"
                        >
                          {savingId === sensor.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setBleSelectedSensorId?.(sensor.id);
                            setSelectedItem?.("Sensor Monitor");
                          }}
                          title="Open in BLE Scanner"
                          className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded hover:bg-indigo-200 transition"
                        >
                          <i className="fa-brands fa-bluetooth" />
                        </button>
                        <button
                          onClick={() => startEdit(sensor)}
                          className="bg-secondary-green text-white text-xs font-bold px-3 py-1 rounded hover:opacity-90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sensor)}
                          disabled={deletingId === sensor.id}
                          className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === sensor.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Coordinates */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Latitude</p>
                    {isEditing ? (
                      <input
                        value={editForm.editLatitude}
                        onChange={(e) => setEditForm((f) => ({ ...f, editLatitude: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{coords[1] ?? "N/A"}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Longitude</p>
                    {isEditing ? (
                      <input
                        value={editForm.editLongitude}
                        onChange={(e) => setEditForm((f) => ({ ...f, editLongitude: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{coords[0] ?? "N/A"}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <p className="text-xs text-indigo-500 italic text-center">
                    Click on the map above to update coordinates automatically.
                  </p>
                )}

                {/* Readings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className="font-bold text-red-600 text-sm">
                      {sensor.temp != null ? `${sensor.temp} °C` : "N/A"}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="font-bold text-blue-600 text-sm">
                      {sensor.humidity != null ? `${sensor.humidity} %` : "N/A"}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Light</p>
                    <p className="font-bold text-yellow-600 text-sm">
                      {sensor.light != null ? `${sensor.light} lux` : "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Soil Moisture</p>
                    <p className="font-bold text-green-600 text-sm">
                      {sensor.soilMoisture != null ? `${sensor.soilMoisture} %` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
