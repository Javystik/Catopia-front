import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Save } from 'lucide-react';
import { getAllGenres, deleteGenre, createGenre, updateGenre } from '../../api/genreApi';
import { useNotification } from '../../components/NotificationProvider';
import ConfirmModal from '../../components/ConfirmModal';

const GenreManagementPage = () => {
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [genreToDelete, setGenreToDelete] = useState(null);
  const [genreToEdit, setGenreToEdit] = useState(null);
  const [newGenreName, setNewGenreName] = useState('');
  const [editGenreName, setEditGenreName] = useState('');

  const { notify } = useNotification();

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const data = await getAllGenres();
      const sorted = [...data].sort((a, b) => a.id - b.id);
      setGenres(sorted);
    } catch {
      notify('error', 'Помилка при завантаженні жанрів');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const validateGenreName = (name, excludeId = null) => {
    if (!name.trim()) {
      notify('error', 'Назва жанру не може бути порожньою');
      return false;
    }
    if (genres.some((g) => g.name.toLowerCase() === name.toLowerCase() && g.id !== excludeId)) {
      notify('error', 'Жанр з такою назвою вже існує');
      return false;
    }
    return true;
  };

  const handleCreateGenre = async () => {
    if (!validateGenreName(newGenreName)) return;
    try {
      const newGenre = await createGenre({ name: newGenreName });
      setGenres((prev) => [...prev, newGenre].sort((a, b) => a.id - b.id));
      setNewGenreName('');
      notify('success', 'Жанр створено');
    } catch {
      notify('error', 'Помилка при створенні жанру');
    }
  };

  const handleEditClick = (genre) => {
    setGenreToEdit(genre);
    setEditGenreName(genre.name);
    setEditModalVisible(true);
  };

  const handleUpdateGenre = async () => {
    if (!validateGenreName(editGenreName, genreToEdit.id)) return;
    try {
      const updated = await updateGenre(genreToEdit.id, { name: editGenreName });
      setGenres((prev) =>
        prev.map((g) => (g.id === genreToEdit.id ? updated : g)).sort((a, b) => a.id - b.id)
      );
      setEditModalVisible(false);
      setGenreToEdit(null);
      notify('success', 'Жанр оновлено');
    } catch {
      notify('error', 'Помилка при оновленні жанру');
    }
  };

  const handleDeleteClick = (genre) => {
    setGenreToDelete(genre);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!genreToDelete) return;
    try {
      await deleteGenre(genreToDelete.id);
      setGenres((prev) => prev.filter((g) => g.id !== genreToDelete.id));
      notify('success', 'Жанр видалено');
    } catch {
      notify('error', 'Помилка при видаленні жанру');
    } finally {
      setModalVisible(false);
      setGenreToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
    setGenreToDelete(null);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setGenreToEdit(null);
    setEditGenreName('');
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Керування жанрами</h2>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
        <input
          type="text"
          placeholder="Пошук жанру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Новий жанр"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <button
            onClick={handleCreateGenre}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            title="Створити жанр"
          >
            <Plus size={18} />
            <span>Створити</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredGenres.length === 0 ? (
        <p className="text-gray-600 text-center">Жанрів не знайдено.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-16">ID</th>
                <th className="px-6 py-4 text-left">Назва</th>
                <th className="px-6 py-4 text-center w-32">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredGenres.map((genre, index) => (
                <tr
                  key={genre.id}
                  className={`text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 text-center">{genre.id}</td>
                  <td className="px-6 py-4">{genre.name}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(genre)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Редагувати"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(genre)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Видалити"
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

      {modalVisible && genreToDelete && (
        <ConfirmModal
          title="Підтвердити видалення"
          message={`Ви впевнені, що хочете видалити жанр "${genreToDelete.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {editModalVisible && genreToEdit && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Редагувати жанр</h3>
            <input
              type="text"
              value={editGenreName}
              onChange={(e) => setEditGenreName(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Назва жанру"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleUpdateGenre}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreManagementPage;