import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const sentimentMap = {
  'Позитивний': { emoji: '😊', label: 'Позитивний' },
  'Нейтральний': { emoji: '😐', label: 'Нейтральний' },
  'Негативний': { emoji: '☹️', label: 'Негативний' }
};

const ReviewCard = ({ review }) => {
  const sentiment = sentimentMap[review.sentiment] || { emoji: '', label: '' };

  return (
    <Link
      to={`/review/${review.id}`}
      className="block bg-white rounded-xl shadow-md w-[262px] h-[274px] overflow-hidden hover:shadow-lg transition"
    >
      <img
        src={review.imageNovelUrl || '/images/default_novel.png'}
        alt={review.title}
        className="w-full h-[83.84px] object-cover"
      />
      <div className="p-3 flex flex-col h-[190px]">
        <div className="text-[13px] text-gray-500 flex items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h10M4 14h7" />
          </svg>
          <span>Відгук</span>
          <span>{sentiment.emoji}</span>
          <span>{sentiment.label}</span>
        </div>
        <h3 className="text-[#212529] text-[15px] font-semibold leading-snug line-clamp-2">{review.title}</h3>
        <p className="text-[14px] text-[#212529] leading-snug">
          {review.text.length > 100 ? review.text.slice(0, 100) + '...' : review.text}
        </p>
        <div className="border-t border-gray-200 mt-auto pt-2 text-[12px] text-gray-500 flex justify-between">
          <span>👁 {review.views}</span>
          <span>❤️ {review.likes}</span>
          <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: uk })}</span>
        </div>
      </div>
    </Link>
  );
};

export default ReviewCard;