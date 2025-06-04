import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Save } from 'lucide-react';
import { getAllTags, deleteTag, createTag, updateTag } from '../../api/tagApi';
import { useNotification } from '../../components/NotificationProvider';
import ConfirmModal from '../../components/ConfirmModal';

const TagManagementPage = () => {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [tagToEdit, setTagToEdit] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [editTagName, setEditTagName] = useState('');

  const { notify } = useNotification();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await getAllTags();
      const sorted = [...data].sort((a, b) => a.id - b.id);
      setTags(sorted);
    } catch {
      notify('error', 'Помилка при завантаженні тегів');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const validateTagName = (name, excludeId = null) => {
    if (!name.trim()) return 'Назва тегу не може бути порожньою';
    if (tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase() && tag.id !== excludeId)) {
      return 'Тег з такою назвою вже існує';
    }
    return '';
  };

  const handleCreateTag = async () => {
    const error = validateTagName(newTagName);
    if (error) {
      notify('error', error);
      return;
    }

    try {
      const newTag = await createTag({ name: newTagName });
      setTags((prev) => [...prev, newTag].sort((a, b) => a.id - b.id));
      setNewTagName('');
      setCreateModalVisible(false);
      notify('success', 'Тег створено');
    } catch {
      notify('error', 'Помилка при створенні тегу');
    }
  };

  const handleEditClick = (tag) => {
    setTagToEdit(tag);
    setEditTagName(tag.name);
    setEditModalVisible(true);
  };

  const handleUpdateTag = async () => {
    const error = validateTagName(editTagName, tagToEdit.id);
    if (error) {
      notify('error', error);
      return;
    }

    try {
      const updatedTag = await updateTag(tagToEdit.id, { name: editTagName });
      setTags((prev) =>
        prev.map((t) => (t.id === tagToEdit.id ? updatedTag : t)).sort((a, b) => a.id - b.id)
      );
      setEditModalVisible(false);
      setTagToEdit(null);
      notify('success', 'Тег оновлено');
    } catch {
      notify('error', 'Помилка при оновленні тегу');
    }
  };

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setConfirmDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete.id);
      setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
      notify('success', 'Тег видалено');
    } catch {
      notify('error', 'Помилка при видаленні тегу');
    } finally {
      setConfirmDeleteModalVisible(false);
      setTagToDelete(null);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Керування тегами</h2>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
        <input
          type="text"
          placeholder="Пошук тегу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />

        <button
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Створити тег</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTags.length === 0 ? (
        <p className="text-gray-600 text-center">Тегів не знайдено.</p>
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
              {filteredTags.map((tag, index) => (
                <tr
                  key={tag.id}
                  className={`text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 text-center">{tag.id}</td>
                  <td className="px-6 py-4">{tag.name}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(tag)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Редагувати"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tag)}
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

      {confirmDeleteModalVisible && tagToDelete && (
        <ConfirmModal
          title="Підтвердити видалення"
          message={`Ви впевнені, що хочете видалити тег "${tagToDelete.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setConfirmDeleteModalVisible(false);
            setTagToDelete(null);
          }}
        />
      )}

      {createModalVisible && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Створити тег</h3>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              placeholder="Назва тегу"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setCreateModalVisible(false);
                  setNewTagName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleCreateTag}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Створити
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalVisible && tagToEdit && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Редагувати тег</h3>
            <input
              type="text"
              value={editTagName}
              onChange={(e) => setEditTagName(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Назва тегу"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditModalVisible(false);
                  setTagToEdit(null);
                  setEditTagName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleUpdateTag}
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

export default TagManagementPage;
