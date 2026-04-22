import { useState } from 'react';
import Navbar from '../components/navbar/Navbar';
import DashboardOverview from '../components/dashboard/overview/DashboardOverview';
import Reports from '../components/dashboard/reports/reports';
import ImportData from '../components/dashboard/import/import';
import ArboretumMap from '../components/dashboard/map/ArboretumMap';
import Settings from '../components/dashboard/settings/Settings';

export default function Overview() {
  const [selectedItem, setSelectedItem] = useState("Overview");

  const renderContent = () => {
    switch (selectedItem) {
      case "Overview":
        return <DashboardOverview setSelectedItem={setSelectedItem} />;
      case "Arboretum Map":
        return <ArboretumMap />;
      case "Reports":
        return <Reports />;
      case "Import dataset":
        return <ImportData />;
      case "Settings":
        return <Settings />;
      default:
        return <DashboardOverview setSelectedItem={setSelectedItem} />;
    }
  };


  return (
    <main className='h-full w-full flex flex'>
      <div className='w-[300px] h-full'>
        <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </div>
      <div className='w-full h-full overflow-y-auto'>
        {renderContent()}
      </div>
    </main>
  )
}
