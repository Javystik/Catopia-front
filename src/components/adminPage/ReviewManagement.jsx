import React, { useEffect, useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllReviews, deleteReview } from '../../api/reviewApi';
import { useNotification } from '../../components/NotificationProvider';
import ConfirmModal from '../../components/ConfirmModal';

const truncate = (string, number) =>
  string.length > number ? string.slice(0, number) + '…' : string;

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();
      setReviews(data.sort((a, b) => a.id - b.id));
    } catch {
      notify('error', 'Помилка при завантаженні відгуків');
    } finally {
      setLoading(false);
    }
  };

  fetchReviews();
}, []);

  const handleDelete = (review) => {
    setSelectedReview(review);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteReview(selectedReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== selectedReview.id));
      notify('success', 'Відгук видалено');
    } catch {
      notify('error', 'Не вдалося видалити відгук');
    } finally {
      setConfirmVisible(false);
      setSelectedReview(null);
    }
  };

  const cancelDelete = () => {
    setConfirmVisible(false);
    setSelectedReview(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-[#212529] mb-4">Керування відгуками</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600">Відгуків поки немає.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 text-center w-12">ID</th>
                <th className="px-4 py-3 text-left">Назва</th>
                <th className="px-4 py-3 text-left">Текст</th>
                <th className="px-4 py-3 text-left">Автор</th>
                <th className="px-4 py-3 text-center">Лайки</th>
                <th className="px-4 py-3 text-center">Дизлайки</th>
                <th className="px-4 py-3 text-center">Дата</th>
                <th className="px-4 py-3 text-center">Дії</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr
                  key={review.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-sm hover:bg-gray-100`}
                >
                  <td className="px-4 py-3 text-center">{review.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/review/${review.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {truncate(review.title, 40)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{truncate(review.text, 60)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{review.authorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{review.likes ?? 0}</td>
                  <td className="px-4 py-3 text-center">{review.dislikes ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <Link
                        to={`/editReview/${review.novelId}/${review.titleSlug}/${review.titleName}/${review.id}`}
                        title="Редагувати"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(review)}
                        title="Видалити"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmVisible && selectedReview && (
        <ConfirmModal
          title="Підтвердити видалення"
          message={`Ви впевнені, що хочете видалити відгук "${selectedReview.title}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default ReviewManagement;
