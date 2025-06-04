import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const UpdateCard = ({ update }) => (
  <Link
    to={`/novel/${update.id}/${update.slug}`}
    className="flex items-center space-x-4 pb-4 border-b border-gray-200 hover:bg-gray-50 transition rounded-lg px-2 py-2 -mx-2"
  >
    <div className="relative w-[80px] h-[112px] rounded overflow-hidden flex-shrink-0">
      <img src={update.coverUrl} alt={update.titleUk} className="w-full h-full object-cover rounded" />
      <div
        className="absolute inset-0 pointer-events-none rounded"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      <span
        className="absolute top-1 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-0.5 text-center rounded shadow-md"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {update.type}
      </span>
    </div>
    <div className="flex flex-col justify-center text-sm">
      <span className="font-semibold text-[17px] leading-snug mb-1 hover:text-blue-600 transition">{update.titleUk}</span>
      <span className="text-gray-700">
        <span className="font-semibold">
          Том {update.lastVolumeNumber} Розділ {update.lastChapterNumber}
        </span>
        {update.lastChapterTitle && ` – ${update.lastChapterTitle}`}
      </span>
      <span className="text-gray-400 text-xs mt-1">
        {formatDistanceToNow(new Date(update.updatedAt), { addSuffix: true, locale: uk })}
      </span>
    </div>
  </Link>
);

export default UpdateCard;