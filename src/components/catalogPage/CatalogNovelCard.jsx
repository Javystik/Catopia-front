import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNovelDetailById } from '../../api/novelApi';
import { Link } from 'react-router-dom';

export default function CatalogNovelCard({ Novel, rating }) {
  const [showInfo, setShowInfo] = useState(false);
  const [novelDetails, setNovelDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const hoverTimer = useRef(null);
  const leaveTimer = useRef(null);

  motion;

  if (!Novel?.titleUk || !Novel?.coverUrl) {
    return null;
  }

  const handleEnter = () => {
    clearTimeout(leaveTimer.current);
    setShowSkeleton(true);
    hoverTimer.current = setTimeout(() => {
      setShowInfo(true);
      fetchNovelDetails();
    }, 1000);
  };

  const handleLeave = () => {
    clearTimeout(hoverTimer.current);
    leaveTimer.current = setTimeout(() => {
      setShowInfo(false);
      setShowSkeleton(false);
    }, 300);
  };

  const fetchNovelDetails = async () => {
    if (novelDetails || isLoading) return;
    setIsLoading(true);
    try {
      const data = await getNovelDetailById(Novel.id);
      setNovelDetails(data);
    } catch (error) {
      console.error('Не вдалося отримати деталі новели:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 6) return 'bg-green-500';
    if (rating >= 3) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div
      className="relative flex flex-col bg-white rounded-2xl cursor-pointer max-w-[180px]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {rating && (
        <div className={`absolute top-3 left-1 ${getRatingColor(rating)} text-white text-xs font-bold px-2.5 py-0.5 rounded-md z-10`}>
          {rating}
        </div>
      )}

      <Link
        to={`/novel/${Novel.id}/${Novel.slug}`}
        className="flex flex-col p-2 hover:bg-gray-50 transition rounded-2xl"
      >
        <div className="relative w-full aspect-[157/220] overflow-hidden rounded-lg bg-gray-100">
          <img
            src={Novel.coverUrl}
            alt={Novel.titleUk}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="flex flex-col mt-1 pl-0.5">
          <h3 className="text-[16px] font-semibold leading-tight text-gray-800 line-clamp-2 hover:text-blue-600 transition">
            {Novel.titleUk}
          </h3>
          <p className="text-[14px] text-gray-500">
            {Novel.type && Novel.lastChapterTitle ? (
              `${Novel.type} - ${Novel.lastChapterTitle}`
            ) : (
              <span className="inline-block h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
            )}
          </p>
        </div>
      </Link>

      <AnimatePresence>
        {(showInfo || showSkeleton) && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-0 left-[calc(100%+12px)] w-[340px] p-5 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl z-20 border border-gray-100"
          >
            {isLoading || !novelDetails ? (
              <div className="flex flex-col gap-3">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 bg-gray-200 rounded-full w-16 h-6 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{novelDetails.titleUk}</h2>
                <p className="text-sm text-gray-600 italic">{novelDetails.titleEn}</p>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Статус: <span className="text-gray-700">{novelDetails.status}</span></span>
                  <span>Рік: <span className="text-gray-700">{novelDetails.releaseYear}</span></span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Глав: <span className="text-gray-700">{novelDetails.chapterCount}</span></span>
                  <span>Тип: <span className="text-gray-700">{Novel.type}</span></span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{novelDetails.description}</p>
                <div className="flex flex-wrap gap-2">
                  {[...novelDetails.tags].slice(0, 5).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full max-w-[120px] truncate hover:bg-gray-200 transition"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {[...novelDetails.genres].slice(0, 5).map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full max-w-[120px] truncate hover:bg-blue-200 transition"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}