import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const NAV_SECTIONS = [
  {
    title: "MAP",
    items: [
      { name: "map:overview", label: "Overview",  icon: "fa-chart-line",    tab: "overview" },
      { name: "map:elements", label: "Elements",  icon: "fa-seedling",      tab: "elements", pendingBadge: true },
      { name: "map:sensors",  label: "Sensors",   icon: "fa-wifi",          tab: "sensors"  },
      { name: "map:zones",    label: "Zones",     icon: "fa-draw-polygon",  tab: "zones"    },
    ],
  },
  {
    title: "TOOLS",
    items: [
      { name: "Sensor Monitor",  label: "Sensor Monitor",  icon: "fa-bluetooth", badge: "Live" },
      { name: "Reports",         label: "Reports",         icon: "fa-chart-bar"               },
      { name: "Import dataset",  label: "Import dataset",  icon: "fa-upload"                  },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Settings", label: "Settings", icon: "fa-cog" },
    ],
  },
];

export default function Navbar({ selectedItem, setSelectedItem, setActiveTab, activeTab, pendingCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState(
    NAV_SECTIONS.reduce((acc, s) => ({ ...acc, [s.title]: true }), {})
  );
  const navigate = useNavigate();

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSelect = (item) => {
    if (item.tab) {
      setSelectedItem("Map");
      setActiveTab(item.tab);
    } else {
      setSelectedItem(item.name);
    }
    setIsOpen(false);
  };

  const isItemSelected = (item) => {
    if (item.tab) return selectedItem === "Map" && activeTab === item.tab;
    return selectedItem === item.name;
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-border text-text-primary rounded-xl flex items-center justify-center shadow-sm cursor-pointer"
      >
        <i className="fa-solid fa-bars" />
      </button>
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />
      )}

      <nav className={`
        fixed md:static top-0 left-0 z-50
        w-[220px] md:w-[220px]
        h-screen md:h-full
        bg-[#1E293B] border-r border-slate-700/40 flex flex-col
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}>
        {/* Branding */}
        <div className="w-full h-[60px] px-4 flex items-center justify-between shrink-0 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Loggin Logo" className="w-8 h-8 shrink-0" />
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">Loggin</p>
              <p className="text-[10px] leading-tight font-bold text-slate-400">Dashboard</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white text-lg cursor-pointer">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto py-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-bold tracking-widest text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
              >
                {section.title}
                <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-200 ${openSections[section.title] ? "rotate-0" : "-rotate-90"}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections[section.title] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                {section.items.map((item) => {
                  const selected = isItemSelected(item);
                  const pendingBadgeCount = item.pendingBadge ? pendingCount : 0;
                  return (
                    <div
                      key={item.name}
                      onClick={() => handleSelect(item)}
                      className={`h-[44px] w-full flex items-center px-4 gap-2.5 cursor-pointer transition-colors duration-150 border-l-[3px] ${
                        selected
                          ? "bg-slate-800/80 border-game-blue text-white"
                          : "border-transparent text-slate-300 hover:bg-slate-800/40 hover:text-white"
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-sm w-4 text-center shrink-0 ${selected ? "text-game-blue" : "text-slate-400"}`} />
                      <span className={`text-sm flex-1 truncate ${selected ? "font-bold text-white" : "font-semibold"}`}>
                        {item.label}
                      </span>
                      {pendingBadgeCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-game-amber text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {pendingBadgeCount > 99 ? "99+" : pendingBadgeCount}
                        </span>
                      )}
                      {item.badge && pendingBadgeCount === 0 && (
                        <span className="text-[9px] font-bold text-game-blue border border-game-blue/40 rounded px-1.5 py-0.5 leading-none bg-game-blue/10">
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
        <div className="shrink-0 p-3 border-t border-slate-700/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket text-sm w-4" />
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
