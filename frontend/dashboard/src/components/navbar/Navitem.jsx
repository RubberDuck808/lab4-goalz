export default function Navitem({ name, icon, selectedItem, setSelectedItem, badge }) {
  const isSelected = selectedItem === name;

  return (
    <div
      onClick={() => setSelectedItem(name)}
      className={`flex items-center px-5 py-4 gap-3 cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'border-l-4 border-game-blue bg-white/10 text-white'
          : 'border-l-4 border-transparent text-text-secondary hover:text-white hover:bg-white/5'
      }`}
    >
      <i className={`fa-solid ${icon} text-sm w-4 text-center`}></i>
      <p className={`whitespace-nowrap text-sm flex-1 ${isSelected ? 'font-bold text-white' : ''}`}>
        {name}
      </p>
      {badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 bg-game-amber text-secondary-black text-[11px] font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
}
