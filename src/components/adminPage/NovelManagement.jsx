import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { getLatestNovelsAll, deleteNovelById } from '../../api/novelApi';
import { useNotification } from '../../components/NotificationProvider';
import ConfirmModal from '../../components/ConfirmModal';

const NovelManagement = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [novelToDelete, setNovelToDelete] = useState(null);

  const { notify } = useNotification();

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const data = await getLatestNovelsAll();
      const sorted = [...data].sort((a, b) => a.id - b.id);
      setNovels(sorted);
    } catch (error) {
      console.error('Failed to fetch novels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const handleDeleteClick = (novel) => {
    setNovelToDelete(novel);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!novelToDelete) return;

    try {
      await deleteNovelById(novelToDelete.id);
      notify('success', 'Новелу успішно видалено');
      setNovels((prev) => prev.filter((n) => n.id !== novelToDelete.id));
    } catch {
      notify('error', 'Помилка при видаленні новели');
    } finally {
      setModalVisible(false);
      setNovelToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
    setNovelToDelete(null);
  };

  const filteredNovels = novels.filter((novel) =>
    novel.titleUk.toLowerCase().includes(search.toLowerCase()) ||
    novel.titleEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#212529] mb-4">Керування новелами</h2>

      <input
        type="text"
        placeholder="Пошук за назвою..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <p className="text-gray-600">Завантаження...</p>
      ) : filteredNovels.length === 0 ? (
        <p className="text-gray-600">Новел не знайдено.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-16">ID</th>
                <th className="px-4 py-3 text-center w-20">Обкл.</th>
                <th className="px-4 py-3 text-left w-1/4">Назва (укр)</th>
                <th className="px-4 py-3 text-left w-1/4 hidden md:table-cell">Назва (англ)</th>
                <th className="px-4 py-3 text-center w-16">Розділи</th>
                <th className="px-4 py-3 text-center w-20">Тип</th>
                <th className="px-4 py-3 text-center w-24">Статус</th>
                <th className="px-4 py-3 text-center w-28">Створено</th>
                <th className="px-4 py-3 text-center w-24">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredNovels.map((novel) => (
                <tr key={novel.id} className="hover:bg-gray-50 text-sm border-b border-gray-100">
                  <td className="px-4 py-3 text-center align-middle">{novel.id}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    {novel.coverUrl ? (
                      <img
                        src={novel.coverUrl}
                        alt="cover"
                        className="w-10 h-14 object-cover rounded shadow-sm mx-auto"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 flex items-center justify-center text-gray-500 rounded shadow-sm mx-auto">
                        ?
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle max-w-[200px] truncate">
                    <Link to={`/novel/${novel.id}/${novel.slug}`} className="text-blue-600 hover:underline">
                      {novel.titleUk}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-middle max-w-[200px] truncate hidden md:table-cell">
                    {novel.titleEn}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">{novel.chapterCount}</td>
                  <td className="px-4 py-3 text-center align-middle">{novel.type}</td>
                  <td className="px-4 py-3 text-center align-middle">{novel.status}</td>
                  <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                    {new Date(novel.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/createTitle/${novel.id}`}
                        title="Редагувати"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        onClick={() => handleDeleteClick(novel)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalVisible && novelToDelete && (
        <ConfirmModal
          title="Підтвердити видалення"
          message={`Ви впевнені, що хочете видалити новелу "${novelToDelete.titleUk}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default NovelManagement;