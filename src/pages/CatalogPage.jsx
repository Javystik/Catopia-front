import React, { useState, useEffect } from 'react';
import CatalogNovelCard from '../components/catalogPage/CatalogNovelCard';
import FilterPanel from '../components/catalogPage/FilterPanel';
import CatalogSortPanel from '../components/catalogPage/CatalogSortPanel';
import { Helmet } from 'react-helmet';
import { searchNovels, getLatestNovelsAll } from '../api/novelApi';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function CatalogPage() {
  const [appliedFilters, setAppliedFilters] = useState({
    genreIds: [],
    tagIds: [],
    minChapterCount: null,
    maxChapterCount: null,
    minReleaseYear: null,
    maxReleaseYear: null,
    ageRating: null,
    type: null,
    status: null,
  });
  const [appliedSearchValue, setAppliedSearchValue] = useState('');
  const [appliedSort, setAppliedSort] = useState('popularity');
  const [appliedOrder, setAppliedOrder] = useState('desc');

  const [pendingSearchValue, setPendingSearchValue] = useState('');
  const [pendingSort, setPendingSort] = useState('popularity');
  const [pendingOrder, setPendingOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialNovels = async () => {
      try {
        setIsLoading(true);
        const fetchedNovels = await getLatestNovelsAll();
        setNovels(fetchedNovels);
      } catch (error) {
        console.error('Failed to load initial novels:', error);
        setNovels([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialNovels();
  }, []);

  useEffect(() => {
    const loadNovels = async () => {
      try {
        setIsLoading(true);
        const filter = {
          genreIds: appliedFilters.genreIds || [],
          tagIds: appliedFilters.tagIds || [],
          minChapterCount: appliedFilters.minChapterCount || null,
          maxChapterCount: appliedFilters.maxChapterCount || null,
          minReleaseYear: appliedFilters.minReleaseYear || null,
          maxReleaseYear: appliedFilters.maxReleaseYear || null,
          ageRating: appliedFilters.ageRating || null,
          type: appliedFilters.type || null,
          status: appliedFilters.status || null,
          name: appliedSearchValue || null,
          sort: appliedSort,
          order: appliedOrder,
        };
        console.log('Applied filters:', JSON.stringify(filter, null, 2));
        const fetchedNovels = await searchNovels(filter);
        setNovels(fetchedNovels);
      } catch (error) {
        console.error('Failed to load novels:', error);
        setNovels([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNovels();
  }, [appliedFilters, appliedSearchValue, appliedSort, appliedOrder]);

  const handleApplyFilters = (newFilters, newSearchValue, newSort, newOrder) => {
    setAppliedFilters(newFilters);
    setAppliedSearchValue(newSearchValue);
    setAppliedSort(newSort);
    setAppliedOrder(newOrder);
    setIsFilterOpen(false);
  };

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-6">
      <Helmet>
        <title>Catopia — Каталог новел</title>
      </Helmet>

      <button
        className="md:hidden fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50"
        onClick={toggleFilterPanel}
      >
        {isFilterOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      <div className="mx-[4%] md:mx-[10%] flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[70%] bg-white rounded-xl shadow p-5">
          <CatalogSortPanel
            searchValue={pendingSearchValue}
            onSearchChange={setPendingSearchValue}
            sort={pendingSort}
            onSortChange={setPendingSort}
            order={pendingOrder}
            onOrderChange={setPendingOrder}
          />
          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))] gap-4">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="flex flex-col bg-white rounded-2xl p-2">
                  <div className="w-full aspect-[157/220] bg-gray-300 rounded-lg animate-pulse" />
                  <div className="mt-1 pl-0.5">
                    <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : novels.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))] gap-4">
              {novels.map(novel => (
                <CatalogNovelCard key={novel.id} Novel={novel} rating={novel.rating} />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10 text-lg">
              Тайтлів не знайдено
            </div>
          )}
        </div>

        <div
          className={`fixed md:static top-8 left-0 w-full md:w-[30%] h-full md:h-[calc(100vh-5rem)] bg-white rounded-xl shadow p-5 z-40 transition-transform duration-300 ease-in-out ${
            isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="h-full overflow-y-auto">
            <FilterPanel
              onApplyFilters={(newFilters) =>
                handleApplyFilters(newFilters, pendingSearchValue, pendingSort, pendingOrder)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}