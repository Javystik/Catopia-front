import React, { useState, useEffect, useRef } from 'react'

const sortOptions = [
  { label: 'За популярністю', value: 'popularity' },
  { label: 'За рейтингом', value: 'rating' },
  { label: 'За переглядами', value: 'views' },
  { label: 'Кількістю глав', value: 'chapters' },
  { label: 'Датою релізу', value: 'releaseDate' },
  { label: 'Датою оновлення', value: 'updateDate' },
  { label: 'Датою додавання', value: 'addedDate' },
  { label: 'Назвою (A-Z)', value: 'titleAZ' },
  { label: 'Назвою (А-Я)', value: 'titleCyrillic' },
]

const orderOptions = [
  { label: 'За спаданням', value: 'desc' },
  { label: 'За зростанням', value: 'asc' },
]

export default function CatalogSortPanel({
  searchValue,
  onSearchChange,
  sort,
  onSortChange,
  order,
  onOrderChange,
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSortClick = (value) => {
    if (value === 'asc' || value === 'desc') {
      onOrderChange(value)
    } else {
      onSortChange(value)
    }
    setOpen(false)
  }

  const currentSortObj = sortOptions.find(opt => opt.value === sort)
  const sortLabel = currentSortObj?.label || 'Сортування'

  return (
    <div className="mb-4" ref={dropdownRef}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-[#212529]">Каталог</h2>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center px-3 py-1 rounded-md bg-white shadow-sm text-sm hover:bg-gray-50"
          >
            <span className="inline-flex items-center justify-center mr-2">
              <i
                className={`fa-solid ${
                  order === 'desc'
                    ? 'fa-arrow-down-wide-short'
                    : 'fa-arrow-down-short-wide'
                } text-[16px] leading-none`}
              ></i>
            </span>
            <span className="text-[#212529]">{sortLabel}</span>
            <span className="material-icons text-[#212529] text-[18px] ml-2">
              arrow_drop_down
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
              <div className="py-1">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortClick(opt.value)}
                    className="flex items-center w-full px-3 py-1.5 hover:bg-gray-100 text-left text-sm"
                  >
                    <span
                      className={`w-5 h-5 mr-2 rounded-full border flex items-center justify-center ${
                        opt.value === sort ? 'border-orange-500 border-2' : 'border-gray-300'
                      }`}
                    >
                      {opt.value === sort && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      )}
                    </span>
                    <span className="text-[#212529]">{opt.label}</span>
                  </button>
                ))}
                <hr className="my-1 border-gray-200" />
                {orderOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortClick(opt.value)}
                    className="flex items-center w-full px-3 py-1.5 hover:bg-gray-100 text-left text-sm"
                  >
                    <span
                      className={`w-5 h-5 mr-2 rounded-full border flex items-center justify-center ${
                        opt.value === order ? 'border-orange-500 border-2' : 'border-gray-300'
                      }`}
                    >
                      {opt.value === order && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      )}
                    </span>
                    <span className="text-[#212529]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Пошук за назвою"
          className="w-full pl-10 pr-4 py-2 rounded-md text-[15px] border border-[#e0e0e0] focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-100 text-[#212529]"
        />
      </div>
    </div>
  )
}