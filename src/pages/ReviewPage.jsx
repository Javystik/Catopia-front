import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getReviewById } from '../api/reviewApi';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import Comments from '../components/Comments';

export default function ReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await getReviewById(id);
        setReview(data);
      } catch (error) {
        console.error("Failed to fetch review", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Завантаження...</div>;
  }

  if (!review) {
    return <div className="min-h-screen flex justify-center items-center">Відгук не знайдено</div>;
  }

  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: uk,
  });

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
        style={{
          backgroundImage: `url('${review.imageNovelUrl || "/default-bg.png"}')`,
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-6 space-y-6">
        <div className="max-w-3xl w-full bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-6 space-y-6">

        <h1 className="text-3xl font-bold text-center">
            <Link to={`/novel/${review.novelId}/${review.novelSlug}`} className="hover:underline">
                {review.titleName}
            </Link>
        </h1>

          <div className="flex justify-center items-center space-x-2 text-sm text-gray-700">
            <span className="font-semibold">📄 Відгук</span>
            <span
              className={`font-semibold ${
                review.sentiment === 'Позитивний'
                  ? 'text-green-600'
                  : review.sentiment === 'Негативний'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              ● {
                review.sentiment === 'Позитивний'
                  ? 'Позитивний'
                  : review.sentiment === 'Негативний'
                  ? 'Негативний'
                  : 'Нейтральний'
              }
            </span>
          </div>

          <div className="text-center text-sm text-gray-600">
            Автор{" "}
            <Link
                to={`/profile/${review.authorId}`}
                className="text-orange-500 hover:underline"
            >
                {review.authorName}
            </Link>{" "}
            · {timeAgo}
        </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{review.title}</h2>
            <p className="whitespace-pre-line">{review.text}</p>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              {Array.isArray(review.criteria) && review.criteria.length > 0 ? (
                review.criteria.map((criterion, idx) => (
                  <div key={idx} className="flex items-center gap-x-1 text-gray-800 font-medium text-lg">
                    <span className="text-yellow-500 pt-[1px]">⭐</span>
                    <span>{Number(criterion.score)}</span>
                    <span>  -  {criterion.criterionName}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">Оцінки відсутні</div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2 mt-4 text-sm text-gray-600">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{review.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💬</span>
                <span>{commentCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚠️</span>
              </div>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="flex items-center space-x-1 text-green-600">
                <span>👍</span>
                <span>{review.likes || 0}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center space-x-1 text-red-600">
                <span>👎</span>
                <span>{review.dislikes || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl w-full bg-white rounded-xl p-6 py-3">
          <Comments reviewId={id} onCommentCountChange={setCommentCount} />
        </div>
      </div>
    </div>
  );
}
