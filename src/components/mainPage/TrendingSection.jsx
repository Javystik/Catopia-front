import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MINIMUM_LOADING_TIME } from '../../config/config';
import { getLatestNovelsWithChapters, getTrendingNovels, getMostPopularNovels } from '../../api/novelApi';

const TrendingSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [isLoading, setIsLoading] = useState(true);
  const [novelsData, setNovelsData] = useState({
    latest: [],
    trending: [],
    popular: [],
  });

  const blockTitles = {
    latest: { title: 'Новинки', icon: '🆕', bg: 'bg-blue-50' },
    trending: { title: 'Трендові', icon: '🔥', bg: 'bg-red-50' },
    popular: { title: 'Популярні', icon: '⭐', bg: 'bg-yellow-50' },
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
    setIsLoading(true);
  };

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, MINIMUM_LOADING_TIME));

        const apiCalls = [
          getLatestNovelsWithChapters(selectedPeriod),
          getTrendingNovels(selectedPeriod),
          getMostPopularNovels(selectedPeriod),
          timeoutPromise,
        ];

        const [latest, trending, popular] = await Promise.all(apiCalls);

        const processNovels = (novels) => {
          if (novels.length === 1) return [novels[0], novels[0], novels[0]];
          if (novels.length === 2) return [novels[0], novels[1], novels[0]];
          return novels.slice(0, 3);
        };

        setNovelsData({
          latest: processNovels(latest),
          trending: processNovels(trending),
          popular: processNovels(popular),
        });
      } catch (error) {
        console.error('Failed to fetch novels:', error);
        setNovelsData({ latest: [], trending: [], popular: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNovels();
  }, [selectedPeriod]);

  return (
    <div className="px-[10%] py-6 w-full" id="novels">
      <div className="bg-white rounded-2xl p-6 relative w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Зараз читають</h2>
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="day">За день</option>
            <option value="week">За тиждень</option>
            <option value="month">За місяць</option>
          </select>
        </div>

        <div className="hidden md:flex justify-between gap-6 w-full">
          {Object.keys(blockTitles).map((key) => {
            const { title, icon, bg } = blockTitles[key];
            const novels = novelsData[key];

            return (
              <div key={key} className={`flex-1 min-w-0 p-4 rounded-xl ${bg}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {icon} {title}
                </h3>

                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex bg-gray-200 rounded-xl p-3 w-full max-w-[340px] animate-pulse"
                      >
                        <div className="w-[72px] h-[72px] bg-gray-300 rounded-lg mr-4" />
                        <div className="flex flex-col justify-center space-y-2 flex-1">
                          <div className="w-3/4 h-4 bg-gray-300 rounded" />
                          <div className="w-1/2 h-3 bg-gray-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : novels.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Немає новел для відображення
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {novels.map((novel, index) => (
                      <Link
                        to={`/novel/${novel.id}/${novel.slug}`}
                        key={`${novel.id}-${index}`}
                        className="flex bg-white rounded-xl shadow-sm p-3 w-full max-w-[340px] hover:bg-gray-50 transition"
                      >
                        <img
                          src={novel.coverUrl}
                          alt={novel.titleUk}
                          className="w-[72px] h-[72px] object-cover rounded-lg flex-shrink-0 mr-4"
                        />
                        <div className="flex flex-col justify-center space-y-1.5 max-w-[calc(100%-88px)]">
                          <h3 className="text-sm font-semibold truncate hover:text-blue-600 transition">
                            {novel.titleUk}
                          </h3>
                          <p className="text-xs text-gray-400">{novel.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="md:hidden overflow-x-auto flex gap-4 scroll-smooth snap-x snap-mandatory">
          {Object.keys(blockTitles).map((key) => {
            const { title, icon, bg } = blockTitles[key];
            const novels = novelsData[key];

            return (
              <div
                key={key}
                className={`snap-center shrink-0 w-full min-w-full p-4 rounded-xl ${bg} transition-transform duration-300 ease-in-out`}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {icon} {title}
                </h3>

                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex bg-gray-200 rounded-xl p-3 w-full animate-pulse"
                      >
                        <div className="w-[72px] h-[72px] bg-gray-300 rounded-lg mr-4" />
                        <div className="flex flex-col justify-center space-y-2 flex-1">
                          <div className="w-3/4 h-4 bg-gray-300 rounded" />
                          <div className="w-1/2 h-3 bg-gray-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : novels.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Немає новел для відображення
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {novels.map((novel, index) => (
                      <Link
                        to={`/novel/${novel.id}/${novel.slug}`}
                        key={`${novel.id}-${index}`}
                        className="flex bg-white rounded-xl shadow-sm p-3 w-full hover:bg-gray-50 transition"
                      >
                        <img
                          src={novel.coverUrl}
                          alt={novel.titleUk}
                          className="w-[72px] h-[72px] object-cover rounded-lg flex-shrink-0 mr-4"
                        />
                        <div className="flex flex-col justify-center space-y-1.5 max-w-[calc(100%-88px)]">
                          <h3 className="text-sm font-semibold truncate hover:text-blue-600 transition">
                            {novel.titleUk}
                          </h3>
                          <p className="text-xs text-gray-400">{novel.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;
