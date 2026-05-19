import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const NAV_SECTIONS = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Arboretum Dashboard", label: "Dashboard", icon: "fa-chart-line" },
      { name: "Game Map", label: "Game Map", icon: "fa-map" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Element Management", label: "Elements", icon: "fa-seedling" },
      { name: "Sensor Management", label: "Sensors", icon: "fa-wifi" },
      { name: "Sensor Monitor", label: "Sensor Monitor", icon: "fa-bluetooth", badge: "Live" },
    ],
  },
  {
    title: "DATA",
    items: [
      { name: "Reports", label: "Reports", icon: "fa-chart-bar" },
      { name: "Import dataset", label: "Import dataset", icon: "fa-upload" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Settings", label: "Settings", icon: "fa-cog" },
    ],
  },
];

export default function Navbar({ selectedItem, setSelectedItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState(
    NAV_SECTIONS.reduce((acc, section) => ({ ...acc, [section.title]: true }), {})
  );
  const navigate = useNavigate();

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSelect = (name) => {
    setSelectedItem(name);
    setIsOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-secondary-black text-white rounded-lg flex items-center justify-center"
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />
      )}

      <nav
        className={`
          fixed md:static top-0 left-0 z-50
          w-[240px] md:w-[240px]
          h-screen md:h-full
          bg-secondary-black flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Branding */}
        <div className="bg-black w-full h-[70px] px-5 flex gap-3 items-center justify-between shrink-0">
          <div className="flex gap-3 items-center">
            <div className="w-[40px] h-[40px] rounded-full bg-secondary-green flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Humber</h1>
              <h2 className="text-[11px] text-light-green italic leading-tight">Sustainability</h2>
              <h3 className="text-[9px] italic text-light-green leading-tight">Arboretum dashboard</h3>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-5 py-2 text-xs font-semibold tracking-widest text-gray-400 hover:text-gray-200 transition-colors duration-150"
              >
                {section.title}
                <i
                  className={`fa-solid fa-chevron-down text-[9px] transition-transform duration-200 ${
                    openSections[section.title] ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openSections[section.title] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {section.items.map((item) => {
                  const isSelected = selectedItem === item.name;
                  return (
                    <div
                      key={item.name}
                      onClick={() => handleSelect(item.name)}
                      className={`h-[48px] w-full flex items-center px-5 gap-3 cursor-pointer transition-colors duration-150 border-l-[3px] ${
                        isSelected
                          ? "bg-secondary-green border-white"
                          : "border-transparent hover:bg-white/5"
                      }`}
                    >
                      <i
                        className={`fa-solid ${item.icon} text-sm w-4 text-center ${
                          isSelected ? "text-white" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm flex-1 ${
                          isSelected ? "text-white font-semibold" : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-secondary-green border border-secondary-green rounded px-1.5 py-0.5 leading-none">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="shrink-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <i className="fa-solid fa-right-from-bracket text-sm w-4"></i>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
