import React from 'react';
import { Link } from 'react-router-dom';

const NovelCard = ({ novel, wasDragged }) => {
  const handleClick = (e) => {
    if (wasDragged) {
      e.preventDefault();
    }
  };

  return (
    <div className="rounded-xl overflow-hidden flex flex-col items-center w-[135px] flex-shrink-0">
      <Link
        to={`/novel/${novel.id}/${novel.slug}`}
        className="relative cursor-pointer"
        onClick={handleClick}
      >
        <img
          src={novel.coverUrl || '/placeholder-image.jpg'}
          alt={novel.titleUk}
          className="w-[135px] h-[210px] object-cover rounded-xl"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        />
        {novel.chapter && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-[2px] rounded-md">
            {novel.chapter}
          </div>
        )}
      </Link>
      <Link
        to={`/novel/${novel.id}/${novel.slug}`}
        className="w-full px-1 py-1 cursor-pointer"
        onClick={handleClick}
      >
        <h3 className="text-[15px] font-semibold truncate hover:text-blue-600 transition">
          {novel.titleUk}
        </h3>
        {novel.type && <p className="text-xs text-gray-500">{novel.type}</p>}
      </Link>
    </div>
  );
};


export default NovelCard;