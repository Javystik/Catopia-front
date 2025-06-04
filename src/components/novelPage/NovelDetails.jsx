import React from "react";

const NovelDetails = ({ novel, isExpanded, toggleDescription, showAllTags, setShowAllTags, maxLength }) => {
  const tags = Array.isArray(novel?.tags)
    ? novel.tags
        .map(tag => (typeof tag === "object" && tag?.name ? tag.name : tag))
        .sort((a, b) => a.localeCompare(b))
    : Array.from(novel?.tags || [])
        .map(tag => (typeof tag === "object" && tag?.name ? tag.name : tag))
        .sort((a, b) => a.localeCompare(b));

  const genres = Array.isArray(novel?.genres)
    ? novel.genres
        .map(genre => (typeof genre === "object" && genre?.name ? genre.name : genre))
        .sort((a, b) => a.localeCompare(b))
    : Array.from(novel?.genres || [])
        .map(genre => (typeof genre === "object" && genre?.name ? genre.name : genre))
        .sort((a, b) => a.localeCompare(b));

  const description = novel?.description || "Опис відсутній";
  const ageRating = novel?.ageRating || "N/A";

  const truncatedDescription = description.length > maxLength
    ? description.slice(0, maxLength) + "..."
    : description;

  const displayedTags = showAllTags ? tags : tags.slice(0, 8);
  const hiddenTagsCount = tags.length - displayedTags.length;

  return (
    <>
      <div>
        <p className="text-base text-gray-800 max-w-4xl">
          {isExpanded ? description : truncatedDescription}
        </p>
        {description.length > maxLength && (
          <button
            onClick={toggleDescription}
            className="text-orange-500 text-sm mt-1 font-semibold transition-colors hover:text-orange-700 cursor-pointer"
          >
            {isExpanded ? "Згорнути" : "Розгорнути..."}
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {ageRating !== "N/A" && (
          <span className="bg-red-100 text-red-800 text-sm py-1 px-3 rounded-full">
            {ageRating}
          </span>
        )}

        {genres.map((genre, index) => (
          <span
            key={`${genre}-${index}`}
            className="bg-orange-100 text-orange-800 text-sm py-1 px-3 rounded-full"
          >
            {genre}
          </span>
        ))}

        {displayedTags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="bg-gray-200 text-gray-700 text-sm py-1 px-3 rounded-full"
          >
            #{tag}
          </span>
        ))}

        {tags.length > 8 && (
          <span
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-gray-500 text-sm py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100"
          >
            {showAllTags ? "...згорнути" : `+ще ${hiddenTagsCount}`}
          </span>
        )}
      </div>
    </>
  );
};

export default NovelDetails;