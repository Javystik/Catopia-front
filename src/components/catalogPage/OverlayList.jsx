import React, { useState, useMemo, useEffect } from 'react';

export default function OverlayList({
  title,
  items,
  selectedItems,
  onSelect,
  onClose,
  onReset,
  itemKey = (item) => item,
  itemLabel = (item) => item,
}) {
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredItems = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return items.filter((item) =>
      itemLabel(item).toLowerCase().includes(lowerSearch)
    );
  }, [search, items, itemLabel]);

  const toggleItem = (item) => {
    onSelect(item);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 350);
  };

  return (
    <div
      className={`absolute inset-y-0 right-0 bg-white z-20 flex flex-col transition-all duration-350 ease-in-out ${
        isVisible ? 'w-full opacity-100' : 'w-0 opacity-0'
      } overflow-hidden`}
    >
      {/* Верхня панель */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        <button
          onClick={handleClose}
          className="text-gray-600 hover:bg-gray-100 p-1 rounded-full transition flex items-center justify-center"
          style={{ height: '32px', width: '32px' }}
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>
            arrow_back
          </span>
        </button>
        <h4 className="font-semibold text-base text-gray-800 flex-1 text-center">
          {title}
        </h4>
        <button
          onClick={handleReset}
          className={`flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedItems.length > 0
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={selectedItems.length === 0}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>
            close
          </span>
          Сбросити
        </button>
      </div>

      {/* Поле пошуку */}
      <div className="px-4 py-3 border-b border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Фільтр по тегам"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Список жанрів / тегів */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-opacity duration-300 ease-in-out opacity-100">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <label
              key={itemKey(item)}
              className="flex items-center gap-2 text-sm cursor-pointer select-none py-2"
            >
              <input
                type="checkbox"
                className="peer hidden"
                checked={selectedItems.includes(itemKey(item))}
                onChange={() => toggleItem(item)}
              />
              <span className="w-5 h-5 flex items-center justify-center border border-gray-300 rounded-sm transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500">
                <span
                  className="material-icons text-white text-xs peer-checked:text-white transition-opacity duration-200"
                  style={{ fontSize: '16px' }}
                >
                  check
                </span>
              </span>
              <span className="text-gray-800">{itemLabel(item)}</span>
            </label>
          ))
        ) : (
          <div className="text-center text-sm text-gray-400 py-8">
            Нічого не знайдено
          </div>
        )}
      </div>

      {/* Кнопка вибрати */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleClose}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95"
        >
          Вибрати
        </button>
      </div>
    </div>
  );
}