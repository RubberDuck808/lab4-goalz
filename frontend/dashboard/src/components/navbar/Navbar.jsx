import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navitem from "./Navitem";
import { authService } from "../../services/authService";

export default function Navbar({ selectedItem, setSelectedItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setIsOpen(false);
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
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <nav
        className={`
          relative bg-secondary-black w-[260px] h-full fixed md:static top-0 left-0 z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="bg-black w-full h-[70px] p-[20px] flex gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-[45px] h-[45px] rounded-full bg-secondary-green flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>

            <div>
              <h1 className="font text-md font-bold text-white">Humber</h1>
              <h2 className="font text-sm text-light-green italic">
                Sustainability
              </h2>
              <h3 className="font text-[10px] italic text-light-green">
                Arboretum dashboard
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white text-xl"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="w-full flex flex-col flex-1">
          <Navitem
            name="Arboretum Dashboard"
            icon="fa-chart-line"
            selectedItem={selectedItem}
            setSelectedItem={handleSelect}
          />
          <Navitem
            name="Game Map"
            icon="fa-map"
            selectedItem={selectedItem}
            setSelectedItem={handleSelect}
          />
          <Navitem
            name="Reports"
            icon="fa-file-export"
            selectedItem={selectedItem}
            setSelectedItem={handleSelect}
          />
          <Navitem
            name="Import dataset"
            icon="fa-upload"
            selectedItem={selectedItem}
            setSelectedItem={handleSelect}
          />
          <Navitem
            name="Settings"
            icon="fa-cog"
            selectedItem={selectedItem}
            setSelectedItem={handleSelect}
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">
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