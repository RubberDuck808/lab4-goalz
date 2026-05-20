import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/navbar/Navbar';
import MapDashboard from '../components/dashboard/MapDashboard';
import Reports from '../components/dashboard/reports/reports';
import ImportData from '../components/dashboard/import/import';
import Settings from '../components/dashboard/settings/Settings';
import BLEScanner from '../components/dashboard/ble/BLEScanner';
import { overviewService } from '../services/overviewService';

export default function Overview() {
  const [selectedItem, setSelectedItem] = useState("Map");
  const [bleSelectedSensorId, setBleSelectedSensorId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const p = await overviewService.getPendingElements();
      setPendingCount(Array.isArray(p) ? p.length : 0);
    } catch { /* silent — badge stays at last known value */ }
  }, []);

  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);

  const renderContent = () => {
    switch (selectedItem) {
      case "Map":
        return (
          <MapDashboard
            setSelectedItem={setSelectedItem}
            setBleSelectedSensorId={setBleSelectedSensorId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingCount={pendingCount}
            onPendingCountChanged={fetchPendingCount}
          />
        );
      case "Reports":
        return <Reports />;
      case "Import dataset":
        return <ImportData />;
      case "Sensor Monitor":
        return <BLEScanner bleSelectedSensorId={bleSelectedSensorId} setBleSelectedSensorId={setBleSelectedSensorId} />;
      case "Settings":
        return <Settings />;
      default:
        return (
          <MapDashboard
            setSelectedItem={setSelectedItem}
            setBleSelectedSensorId={setBleSelectedSensorId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingCount={pendingCount}
            onPendingCountChanged={fetchPendingCount}
          />
        );
    }
  };

  return (
    <main className='h-full w-full flex'>
      <div className='h-full'>
        <Navbar
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
        />
      </div>
      <div className='w-full h-full overflow-y-auto flex-1'>
        {renderContent()}
      </div>
    </main>
  );
}
