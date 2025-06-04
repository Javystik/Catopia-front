import React, { useRef, useEffect, useState } from 'react';
import NovelCard from '../mainPage/NovelCard';
import { getRecommendationsForUnauthorized } from '../../api/novelRecommendationsApi';
import { MINIMUM_LOADING_TIME } from '../../config/config';

const RecomendsNovels = () => {
  const sliderRef = useRef(null);
  const [novels, setNovels] = useState([]);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, MINIMUM_LOADING_TIME));
        
        const [data] = await Promise.all([
          getRecommendationsForUnauthorized(),
          timeoutPromise
        ]);

        const novelsData = data || [];
        let filledNovels = [];
        if (novelsData.length > 0) {
          while (filledNovels.length < 27) {
            filledNovels = filledNovels.concat(novelsData);
          }
          filledNovels = filledNovels.slice(0, 27);
        }
        setNovels(filledNovels);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setNovels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  useEffect(() => {
    toggleScrollButtons();
  }, [novels]);

  const toggleScrollButtons = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    setShowLeft(slider.scrollLeft > 0);
    setShowRight(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 1);
  };

  const handleScroll = () => {
    toggleScrollButtons();
  };

  const scroll = (direction) => {
    const slider = sliderRef.current;
    const scrollAmount = slider.clientWidth;
    slider.scrollTo({
      left: direction === 'left' ? slider.scrollLeft - scrollAmount : slider.scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const slider = sliderRef.current;
    const moveX = e.clientX - startX;
    if (Math.abs(moveX) > 5) {
      setWasDragged(true);
    }
    slider.scrollLeft = scrollLeft - moveX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
setTimeout(() => setWasDragged(false), 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
setTimeout(() => setWasDragged(false), 0);
  };

  const skeletonCards = Array(27).fill(null);

  return (
    <div className="px-[10%] py-6 w-full">
      <div
        className="bg-white rounded-2xl p-6 relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDragStart={(e) => e.preventDefault()}
          className={`flex overflow-x-auto space-x-4 cursor-grab select-none scrollbar-hide w-full ${isDragging ? 'select-none' : ''}`}
        >

          {loading ? (
            skeletonCards.map((_, idx) => (
              <div key={idx} className="w-[135px] flex-shrink-0 animate-pulse flex flex-col items-center space-y-2">
                <div className="w-[135px] h-[189px] bg-gray-300 rounded-xl" />
                <div className="w-full px-1">
                  <div className="h-4 bg-gray-300 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : novels.length === 0 ? (
            <div className="w-full text-center py-10 text-gray-500 text-lg">
              Не знайдено жодної новели
            </div>
          ) : (
            novels.map((novel, index) => (
              <NovelCard key={`${novel.id}-${index}`} novel={novel} wasDragged = {wasDragged} />
            ))
          )}
        </div>

        {isHovered && showLeft && novels.length > 0 && (
          <button
            onClick={() => scroll('left')}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-[#F5F5F5] p-2 rounded-full hover:bg-[#ffe0b2] transition"
          >
            <span className="material-icons">chevron_left</span>
          </button>
        )}

        {isHovered && showRight && novels.length > 0 && (
          <button
            onClick={() => scroll('right')}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#F5F5F5] p-2 rounded-full hover:bg-[#ffe0b2] transition"
          >
            <span className="material-icons">chevron_right</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RecomendsNovels;