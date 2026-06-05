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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            onCloseSidebar={() => setSidebarOpen(false)}
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
            onCloseSidebar={() => setSidebarOpen(false)}
          />
        );
    }
  };

  return (
    <main className='h-full w-full flex overflow-hidden'>
      <div className='h-full shrink-0'>
        <Navbar
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      </div>
      <div className='flex flex-col flex-1 min-h-0'>
        {/* Spacer so content clears the fixed mobile top bar */}
        <div className='h-[60px] shrink-0 md:hidden' />
        <div className='flex-1 min-h-0 overflow-y-auto'>
          {renderContent()}
        </div>
      </div>
    </main>
  );
}
