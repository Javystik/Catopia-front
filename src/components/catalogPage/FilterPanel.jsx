import React, { useState, useRef, useEffect } from 'react';
import OverlayList from '../catalogPage/OverlayList';
import { getAllGenres } from '../../api/genreApi';
import { getAllTags } from '../../api/tagApi';

const sectionTitle = (title) => (
  <h4 className="font-semibold text-sm mb-2 text-gray-800">{title}</h4>
);

const ageRatings = ['Немає', '6+', '12+', '16+', '18+'];
const novelTypes = ['Японія', 'Корея', 'Китай', 'Англійська', 'Оригінал', 'Фанфік'];
const novelStatuses = ['Онґоінг', 'Завершено', 'Анонсовано', 'Призупинено', 'Відмінено'];

// Mapping from UI values to enum values for the server
const ageRatingToEnum = {
  'Немає': 'NONE',
  '6+': 'SIX_PLUS',
  '12+': 'TWELVE_PLUS',
  '16+': 'SIXTEEN_PLUS',
  '18+': 'EIGHTEEN_PLUS',
};

const novelTypeToEnum = {
  'Японія': 'JAPAN',
  'Корея': 'KOREA',
  'Китай': 'CHINA',
  'Англійська': 'ENGLISH',
  'Оригінал': 'ORIGINAL',
  'Фанфік': 'FANFIC',
};

const novelStatusToEnum = {
  'Онґоінг': 'ONGOING',
  'Завершено': 'COMPLETED',
  'Анонсовано': 'ANNOUNCED',
  'Призупинено': 'PAUSED',
  'Відмінено': 'DISCONTINUED',
};

const MenuButton = ({ title, value, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-100 transition active:scale-[0.98] text-left"
  >
    <span className="text-gray-800 font-medium">{title}</span>
    <div className="flex items-center gap-1 text-gray-400 text-sm">
      <span>{value}</span>
      <span className="material-icons" style={{ fontSize: '18px' }}>
        chevron_right
      </span>
    </div>
  </button>
);

export default function FilterPanel({ onApplyFilters }) {
  const [filters, setFilters] = useState({
    genreIds: [],
    tagIds: [],
    minChapterCount: '',
    maxChapterCount: '',
    minReleaseYear: '',
    maxReleaseYear: '',
    ageRating: '',
    type: '',
    status: '',
  });
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [overlayPanel, setOverlayPanel] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const fetchedGenres = await getAllGenres();
      const fetchedTags = await getAllTags();
      setGenres(fetchedGenres);
      setTags(fetchedTags);
    };
    loadData();

    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // можна закрити панель
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleNumChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || '',
    }));
  };

  const handleOverlayReset = (field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: [],
    }));
  };

  const handleReset = () => {
    setFilters({
      genreIds: [],
      tagIds: [],
      minChapterCount: '',
      maxChapterCount: '',
      minReleaseYear: '',
      maxReleaseYear: '',
      ageRating: '',
      type: '',
      status: '',
    });
    console.clear();
  };

  const handleApply = () => {
    const payload = {};
    if (filters.genreIds.length > 0) payload.genreIds = filters.genreIds;
    if (filters.tagIds.length > 0) payload.tagIds = filters.tagIds;
    if (filters.minChapterCount) payload.minChapterCount = parseInt(filters.minChapterCount);
    if (filters.maxChapterCount) payload.maxChapterCount = parseInt(filters.maxChapterCount);
    if (filters.minReleaseYear) payload.minReleaseYear = parseInt(filters.minReleaseYear);
    if (filters.maxReleaseYear) payload.maxReleaseYear = parseInt(filters.maxReleaseYear);
    if (filters.ageRating) payload.ageRating = ageRatingToEnum[filters.ageRating];
    if (filters.type) payload.type = novelTypeToEnum[filters.type];
    if (filters.status) payload.status = novelStatusToEnum[filters.status];

    onApplyFilters(payload);
  };

  return (
    <div className="relative h-full" ref={panelRef}>
      {overlayPanel && (
        <div
          className={`absolute inset-0 bg-white z-20 transform transition-transform duration-300 ${
            overlayPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <OverlayList
            title={overlayPanel === 'genres' ? 'Жанри' : 'Теги'}
            items={overlayPanel === 'genres' ? genres : tags}
            selectedItems={overlayPanel === 'genres' ? filters.genreIds : filters.tagIds}
            onSelect={(item) => {
              const field = overlayPanel === 'genres' ? 'genreIds' : 'tagIds';
              setFilters((prev) => ({
                ...prev,
                [field]: prev[field].includes(item.id)
                  ? prev[field].filter((i) => i !== item.id)
                  : [...prev[field], item.id],
              }));
            }}
            onReset={() => handleOverlayReset(overlayPanel === 'genres' ? 'genreIds' : 'tagIds')}
            onClose={() => setOverlayPanel(null)}
            itemKey={(item) => item.id}
            itemLabel={(item) => item.name}
          />
        </div>
      )}

      {/* Панель фільтрів */}
      <div className="group overflow-y-auto max-h-[calc(100vh-150px)] scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent scrollbar-thumb-rounded pr-2 pb-24">
        <div className="space-y-5">
          <MenuButton
            title="Жанри"
            value={filters.genreIds.length ? `Вибрано ${filters.genreIds.length}` : 'Будь-які'}
            onClick={() => setOverlayPanel('genres')}
          />
          <MenuButton
            title="Теги"
            value={filters.tagIds.length ? `Вибрано ${filters.tagIds.length}` : 'Будь-які'}
            onClick={() => setOverlayPanel('tags')}
          />

          {/* Кількість глав */}
          <div>
            {sectionTitle('Кількість глав')}
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                placeholder="Від"
                value={filters.minChapterCount}
                onChange={(e) => handleNumChange('minChapterCount', e.target.value)}
                className="w-full max-w-[48%] border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-400 select-none text-xl leading-none max-w-[4%]">–</span>
              <input
                type="number"
                placeholder="До"
                value={filters.maxChapterCount}
                onChange={(e) => handleNumChange('maxChapterCount', e.target.value)}
                className="w-full max-w-[48%] border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Рік релізу */}
          <div>
            {sectionTitle('Рік релізу')}
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                placeholder="Від"
                value={filters.minReleaseYear}
                onChange={(e) => handleNumChange('minReleaseYear', e.target.value)}
                className="w-full max-w-[48%] border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-400 select-none text-xl leading-none max-w-[4%]">–</span>
              <input
                type="number"
                placeholder="До"
                value={filters.maxReleaseYear}
                onChange={(e) => handleNumChange('maxReleaseYear', e.target.value)}
                className="w-full max-w-[48%] border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Віковий рейтинг */}
          <div>
            {sectionTitle('Віковий рейтинг')}
            <select
              value={filters.ageRating}
              onChange={(e) => handleSelectChange('ageRating', e.target.value)}
              className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Будь-який</option>
              {ageRatings.map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </div>

          {/* Тип новели */}
          <div>
            {sectionTitle('Тип')}
            <select
              value={filters.type}
              onChange={(e) => handleSelectChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Будь-який</option>
              {novelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Статус новели */}
          <div>
            {sectionTitle('Статус тайтла')}
            <select
              value={filters.status}
              onChange={(e) => handleSelectChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Будь-який</option>
              {novelStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleReset}
            className="w-[30%] min-w-[120px] border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-100 transition active:scale-95"
          >
            Скинути
          </button>

          <button
            onClick={handleApply}
            className="w-[30%] min-w-[120px] bg-orange-500 text-white rounded px-4 py-2 text-sm hover:bg-orange-600 transition active:scale-95"
          >
            Застосувати
          </button>

          <div className="flex space-x-2 ml-auto cursor-pointer">
            <span className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center transition hover:bg-gray-300 active:scale-95">
              <span className="material-icons text-gray-600">casino</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}