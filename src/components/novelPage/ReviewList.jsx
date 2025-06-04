import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReviewsByNovelId } from "../../api/reviewApi";
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';

const Review = ({ review, hasNext }) => {
  const criteriaArray = review.criteria || [];

  const averageScore = criteriaArray.length > 0
    ? criteriaArray.reduce((sum, c) => sum + (c.score || 0), 0) / criteriaArray.length
    : 0;

  return (
    <div>
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-2 relative">
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded ${
                review.sentiment === "NEGATIVE"
                  ? "bg-red-500"
                  : review.sentiment === "POSITIVE"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
            <img
              src={review.authorAvatarUrl || "/images/user_avatar.png"}
              alt="avatar"
              className="w-6 h-6 rounded bg-gray-200 object-cover ml-2 pl-[2px]"
            />
            <Link
                to={`/profile/${review.authorId}`}
                className="font-medium text-[#0366d6] hover:underline cursor-pointer"
              >
                {review.authorName}
            </Link>
            <span className="text-gray-400">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: uk })}
            </span>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[#222529] mb-1">{review.title}</h2>

        <p className="text-sm text-[#222529] line-clamp-3">{review.text}</p>

        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 font-semibold">
          <span className="text-yellow-500 text-lg">★</span>
          <span>{averageScore.toFixed(1)}</span>
          <span className="font-bold">Кінцева оцінка</span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
          <Link to={`/review/${review.id}`} className="cursor-pointer text-blue-600 hover:underline">
            Читати повністю →
          </Link>
          <span className="flex items-center gap-1">
            👁 {review.views}
          </span>
          <span className="flex items-center gap-1">
            💬 {review.comments}
          </span>
          <span className="flex items-center gap-1">
            ❤ {review.likes}
          </span>
        </div>
      </div>
      {hasNext && <div className="border-b border-gray-200" />}
    </div>
  );
};

const Reviews = ({ novelId, novelSlug, novelName }) => {
  const [reviews, setReviews] = useState([]);
  const [selectedSentiment, setSelectedSentiment] = useState("ALL");

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await getReviewsByNovelId(novelId);
      setReviews(data);
    };
    fetchReviews();
  }, [novelId]);

  const sentimentTabs = [
    { label: "Всі", value: "ALL", count: reviews.length },
    { label: "😊 Позитивні", value: "Позитивний", count: reviews.filter(r => r.sentiment === "Позитивний").length },
    { label: "☹️ Негативні", value: "Негативний", count: reviews.filter(r => r.sentiment === "Негативний").length },
    { label: "😐 Нейтральні", value: "Нейтральний", count: reviews.filter(r => r.sentiment === "Нейтральний").length }
  ];

  const filteredReviews = selectedSentiment === "ALL"
    ? reviews
    : reviews.filter(review => review.sentiment === selectedSentiment);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-4 text-sm text-center font-medium rounded overflow-hidden mb-2">
        {sentimentTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setSelectedSentiment(tab.value)}
            className={`py-2 transition-colors ${
              selectedSentiment === tab.value
                ? "bg-white text-[#222529]"
                : "bg-[#f8f8f9] text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <Link
          to={`/editReview/${novelId}/${novelSlug}/${novelName}`}
          className="ml-auto text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1"
          
        >
          + Написати відгук
        </Link>
      </div>

      <div className="border-b border-gray-200 mb-6" />

      {filteredReviews.length > 0 ? (
        filteredReviews.map((review, index) => (
          <Review
            key={review.id}
            review={review}
            hasNext={index < filteredReviews.length - 1}
          />
        ))
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-2">
            Ох... Схоже тут немає жодного відгуку, тож стань першим, хто поділиться враженням.
          </p>
          <Link
            to={`/editReview/${novelId}/${novelSlug}/${encodeURIComponent(novelName)}`}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Написати відгук
          </Link>
        </div>
      )}
    </div>
  );
};

export default Reviews;