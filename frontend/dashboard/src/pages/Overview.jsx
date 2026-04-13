import { useState } from 'react';
import Navbar from '../components/navbar/Navbar';
import DashboardOverview from '../components/dashboard/overview/DashboardOverview';

export default function Overview() {
  const [selectedItem, setSelectedItem] = useState("Overview");

  const renderContent = () => {
    switch (selectedItem) {
      case "Overview":
        return <DashboardOverview setSelectedItem={setSelectedItem} />;
      case "Reports":
        return <div>Reports content</div>;
      case "Import dataset":
        return <div>Import dataset content</div>;
      case "Settings":
        return <div>Settings content</div>;
      default:
        return <DashboardOverview setSelectedItem={setSelectedItem} />;
    }
  };


  return (
    <main className='h-full w-full flex flex'>
      <div className='w-[300px] h-full'>
        <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </div>
      <div className='w-full h-full'>
        {renderContent()}
      </div>
    </main>
  )
}
