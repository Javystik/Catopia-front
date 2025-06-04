import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { createReview, getReviewById, updateReview } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationProvider';

const EditReviewPage = () => {
  const { user, loading } = useAuth();
  const { id, novelSlug, novelName, reviewId } = useParams();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [criteria, setCriteria] = useState([{ name: 'Кінцева оцінка', value: 1, id: null }]);
  const [ownerId, setOwnerId] = useState(null);
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (reviewId && user?.id) {
      const fetchReview = async () => {
        try {
          const review = await getReviewById(reviewId);
          const isOwner =
            review.authorId === user.id ||
            user?.roles?.some(role => role.name === 'ROLE_ADMIN');

          if (!isOwner) {
            notify('error', 'Ви не маєте прав редагувати цей відгук.');
            navigate(`/novel/${id}/${novelSlug}`);
            return;
          }

          setOwnerId(review.authorId);
          setTitle(review.title);
          setText(review.text);
          setSentiment(review.sentiment);
          setCriteria(
            review.criteria.map(c => ({
              id: c.id || null,
              name: c.criterionName,
              value: c.score,
            }))
          );
        } catch (error) {
          console.error('Помилка при отриманні відгуку:', error);
          notify('error', `Не вдалося завантажити відгук: ${error.message}`);
        }
      };
      fetchReview();
    }
  }, [reviewId, user, id, novelSlug, notify, navigate]);

  const validateForm = () => {
    if (!title.trim()) {
      notify('error', 'Заголовок не може бути порожнім.');
      return false;
    }
    if (title.length > 100) {
      notify('error', 'Заголовок занадто довгий (максимум 100 символів).');
      return false;
    }
    if (!text.trim()) {
      notify('error', 'Текст відгуку не може бути порожнім.');
      return false;
    }
    if (text.length > 5000) {
      notify('error', 'Текст відгуку занадто довгий (максимум 5000 символів).');
      return false;
    }
    if (!sentiment) {
      notify('error', 'Оберіть тональність відгуку.');
      return false;
    }
    if (criteria.some(c => !c.name.trim())) {
      notify('error', 'Усі критерії повинні мати назву.');
      return false;
    }
    if (criteria.some(c => c.value < 1 || c.value > 10)) {
      notify('error', 'Оцінка критерію має бути від 1 до 10.');
      return false;
    }
    const names = criteria.map(c => c.name.trim());
    const uniqueNames = new Set(names.filter(n => n !== 'Кінцева оцінка'));
    if (uniqueNames.size < names.length - 1) {
      notify('error', 'Назви критеріїв (окрім "Кінцева оцінка") мають бути унікальними.');
      return false;
    }
    return true;
  };

  const handleAddCriterion = () => {
    setCriteria([...criteria, { name: '', value: 1, id: null }]);
  };

  const handleRemoveCriterion = (index) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index, key, val) => {
    const updated = [...criteria];
    updated[index][key] = key === 'value' ? Number(val) : val;
    setCriteria(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (loading || !user?.id) {
      notify('error', 'Увійдіть, щоб зберегти відгук.');
      navigate('/login');
      return;
    }

    const isOwner =
      !reviewId ||
      ownerId === user.id ||
      user?.roles?.some(role => role.name === 'ROLE_ADMIN');

    if (!isOwner) {
      notify('error', 'Ви не маєте прав редагувати цей відгук.');
      navigate(`/novel/${id}/${novelSlug}`);
      return;
    }

    const criteriaDTOs = criteria.map(c => ({
      id: c.id || null,
      criterionName: c.name,
      score: c.value,
      reviewId: reviewId
    }));

    const reviewData = {
      id: reviewId || null,
      novelId: id,
      authorId: user.id,
      sentiment,
      title,
      text,
      criteria: criteriaDTOs,
    };

    try {
      if (reviewId) {
        await updateReview(reviewId, reviewData);
        notify('success', 'Відгук успішно оновлено!');
      } else {
        await createReview(reviewData);
        notify('success', 'Відгук успішно створено!');
      }
      navigate(`/novel/${id}/${novelSlug}`);
    } catch (error) {
      console.error('Помилка при збереженні відгуку:', error);
      notify('error', `Помилка при ${reviewId ? 'оновленні' : 'створенні'} відгуку: ${error.message}`);
    }
  };

  if (!user && !loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto bg-white shadow-xl rounded-2xl mt-8 text-center">
        <p className="text-red-600 text-lg">
          Увійдіть, щоб {reviewId ? 'редагувати' : 'створити'} відгук.
        </p>
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Увійти
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-xl rounded-2xl mt-8 space-y-6">
      <nav className="text-sm text-gray-500">
        <span className="hover:underline cursor-pointer">Відгуки</span>
        {' / '}
        <span className="hover:underline cursor-pointer">
          <Link
            to={`/novel/${id}/${novelSlug}`}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            {novelName}
          </Link>{" "}
        </span>
        {' / '}
        <span className="text-gray-700 font-medium">{reviewId ? 'Редагування' : 'Створення'}</span>
      </nav>

      <h1 className="text-3xl font-semibold text-center text-gray-800">
        {reviewId ? 'Редагування відгуку' : 'Створення відгуку'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full border border-gray-300 rounded-lg p-3 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 h-40 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Текст відгуку..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />

        <div>
          <label className="block mb-2 text-gray-700 font-semibold">Ваше враження</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 text-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            required
          >
            <option value="" disabled>Оберіть тональність відгуку</option>
            <option value="Позитивний">😊 Позитивне</option>
            <option value="Нейтральний">😐 Нейтральне</option>
            <option value="Негативний">☹️ Негативне</option>
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700">Критерії оцінювання</h2>
          {criteria.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-gray-50 relative group"
            >
              <span className="text-yellow-500 text-lg">★</span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-lg focus:ring-blue-500 focus:outline-none"
                value={c.value}
                onChange={(e) => handleCriterionChange(i, 'value', e.target.value)}
              >
                {[...Array(10)].map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                ))}
              </select>
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Назва критерію"
                value={c.name}
                onChange={(e) => handleCriterionChange(i, 'name', e.target.value)}
                disabled={c.name === 'Кінцева оцінка'}
                required
              />
              {c.name !== 'Кінцева оцінка' && (
                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(i)}
                  className="p-2 rounded hover:bg-red-100 transition"
                >
                  <img
                    src="/icons/delete.png"
                    alt="Видалити"
                    className="w-5 h-5"
                  />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAddCriterion}
              className="w-1/2 text-blue-600 hover:text-blue-800 font-medium transition text-center"
            >
              + Додати критерій
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition text-center"
            disabled={loading}
          >
            {reviewId ? 'Оновити' : 'Опублікувати'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReviewPage;