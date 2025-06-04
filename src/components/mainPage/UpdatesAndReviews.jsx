import React, { useState, useRef, useEffect } from 'react';
import ReviewCard from '../mainPage/ReviewCard';
import UpdateCard from '../mainPage/UpdateCard';
import { getLatestNovelsSortedByUpdatedAt } from '../../api/novelApi';
import { getAllReviewsSortedByDate } from '../../api/reviewApi';

const UpdatesAndReviews = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [updatesFromServer, setUpdatesFromServer] = useState([]);
  const [reviewsFromServer, setReviewsFromServer] = useState([]);
  const [loading, setLoading] = useState(true);

  const underlineRef = useRef(null);
  const tabsRef = useRef([]);

  useEffect(() => {
    const activeEl = tabsRef.current.find(tab => tab.id === `tab-${activeTab}`);
    if (activeEl && underlineRef.current) {
      underlineRef.current.style.width = `${activeEl.offsetWidth}px`;
      underlineRef.current.style.left = `${activeEl.offsetLeft}px`;
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const updatesData = await getLatestNovelsSortedByUpdatedAt();
        setUpdatesFromServer(updatesData);

        const reviewsData = await getAllReviewsSortedByDate();
        setReviewsFromServer(reviewsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderUpdateSkeletons = () => (
    [...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 pb-4 border-b border-gray-200 animate-pulse">
        <div className="w-[80px] h-[112px] bg-gray-200 rounded" />
        <div className="flex flex-col space-y-2 flex-1">
          <div className="w-3/4 h-4 bg-gray-200 rounded" />
          <div className="w-2/3 h-3 bg-gray-200 rounded" />
          <div className="w-1/4 h-3 bg-gray-200 rounded mt-2" />
        </div>
      </div>
    ))
  );

  const renderReviewSkeletons = () => (
    [...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md w-full max-w-[262px] h-[274px] overflow-hidden animate-pulse">
        <div className="w-full h-[83.84px] bg-gray-200" />
        <div className="p-3 flex flex-col h-[190px] space-y-2">
          <div className="w-1/2 h-4 bg-gray-200 rounded" />
          <div className="w-full h-4 bg-gray-200 rounded" />
          <div className="w-full h-3 bg-gray-200 rounded" />
          <div className="w-full h-3 bg-gray-200 rounded" />
          <div className="mt-auto flex justify-between">
            <div className="w-1/4 h-3 bg-gray-200 rounded" />
            <div className="w-1/4 h-3 bg-gray-200 rounded" />
            <div className="w-1/4 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))
  );

  return (
    <div className="px-[10%] py-6 w-full">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-1/2 p-6 order-1 md:order-2">
          <h2 className="text-xl font-semibold mb-4">Останні відгуки</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {loading
              ? renderReviewSkeletons()
              : reviewsFromServer.slice(0, 4).map((review, i) => (
                  <ReviewCard key={i} review={review} />
                ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 order-2 md:order-1">
          <h2 className="text-[15px] font-semibold mb-4">Останні оновлення</h2>
          <div className="flex space-x-6 mb-4 text-sm font-medium relative">
            {['all', 'my'].map((tab, idx) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                ref={el => (tabsRef.current[idx] = el)}
                className={`tab-button relative pb-2 ${activeTab === tab ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'Всі оновлення' : 'Мої оновлення'}
              </button>
            ))}
            <span
              ref={underlineRef}
              className="absolute bottom-0 h-[4px] bg-[#ffe0b2] rounded-t-md transition-all duration-300"
            />
          </div>

          <div className="space-y-4 w-full">
            {loading
              ? renderUpdateSkeletons()
              : updatesFromServer.map((update, i) => (
                  <UpdateCard key={i} update={update} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesAndReviews;