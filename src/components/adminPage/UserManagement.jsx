import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllUsers,
  addRoleToUser,
  removeRoleFromUser,
  deleteUser,
  updateUser,
} from '../../api/userApi';
import { Pencil, Trash2, Star, StarOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../components/NotificationProvider';

const roleMap = {
  ROLE_USER: 'Користувач',
  ROLE_ADMIN: 'Адмін',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const { notify } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      const sorted = [...data].sort((a, b) => a.id - b.id);
      setUsers(sorted);
    } catch {
      notify('error', 'Помилка при завантаженні користувачів');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (user) => {
    setSelectedUser(user);
    setActionToConfirm({
      type: 'toggleAdmin',
      message: user.roles.some((r) => r.name === 'ROLE_ADMIN')
        ? 'Зняти роль адміністратора з цього користувача?'
        : 'Призначити цього користувача адміністратором?',
    });
    setShowConfirmModal(true);
  };

  const handleDelete = (userId) => {
    if (userId === currentUser?.id) {
      notify('error', 'Ви не можете видалити власний акаунт');
      return;
    }
    setSelectedUser(users.find((u) => u.id === userId));
    setActionToConfirm({
      type: 'delete',
      message: 'Ви дійсно хочете видалити цього користувача?',
    });
    setShowConfirmModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ username: user.username, email: user.email });
    setShowEditModal(true);
  };

  const handleConfirmAction = async () => {
    if (!actionToConfirm || !selectedUser) return;

    try {
      if (actionToConfirm.type === 'toggleAdmin') {
        const isAdmin = selectedUser.roles.some((r) => r.name === 'ROLE_ADMIN');
        const updatedUser = isAdmin
          ? await removeRoleFromUser(selectedUser.id, 'ROLE_ADMIN')
          : await addRoleToUser(selectedUser.id, 'ROLE_ADMIN');
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
        );
        notify('success', `Роль успішно ${isAdmin ? 'знята' : 'призначена'}`);
      } else if (actionToConfirm.type === 'delete') {
        await deleteUser(selectedUser.id);
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        notify('success', 'Користувача успішно видалено');
      }
    } catch {
      notify('error', 'Помилка при виконанні дії');
    }
    setShowConfirmModal(false);
    setActionToConfirm(null);
    setSelectedUser(null);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedUser = await updateUser(selectedUser.id, editForm);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
      notify('success', 'Користувача успішно оновлено');
      setShowEditModal(false);
      setSelectedUser(null);
    } catch {
      notify('error', 'Помилка при оновленні користувача');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#212529] mb-4">
        Керування користувачами
      </h2>

      <input
        type="text"
        placeholder="Пошук за логіном..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      {loading ? (
        <p className="text-gray-500">Завантаження користувачів...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-500">Користувачів не знайдено.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2 border-b">Id</th>
                <th className="px-4 py-2 border-b">Аватар</th>
                <th className="px-4 py-2 border-b">Логін</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">Ролі</th>
                <th className="px-4 py-2 border-b">Створено</th>
                <th className="px-4 py-2 border-b text-center">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isAdmin = user.roles.some((r) => r.name === 'ROLE_ADMIN');
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 group transition">
                    <td className="px-4 py-2 border-b">{user.id}</td>
                    <td className="px-4 py-2 border-b">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          ?
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <Link to={`/profile/${user.id}`} className="text-blue-600 hover:underline">
                        {user.username}
                      </Link>
                    </td>
                    <td className="px-4 py-2 border-b">{user.email}</td>
                    <td className="px-4 py-2 border-b space-y-1">
                      {user.roles.map((r) => (
                        <span
                          key={r.name}
                          className="inline-block bg-gray-200 text-xs text-gray-700 px-2 py-1 rounded mr-1"
                        >
                          {roleMap[r.name] || r.name}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Редагувати"
                        >
                          <Pencil size={18} />
                        </button>
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Видалити"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            className={`${
                              isAdmin
                                ? 'text-yellow-500 hover:text-yellow-700'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={isAdmin ? 'Зняти роль адміністратора' : 'Призначити адміністратора'}
                          >
                            {isAdmin ? <StarOff /> : <Star />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0  bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Редагувати користувача</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Логін</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="mt-1 p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 p-2 border rounded w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Зберегти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0  bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Підтвердження</h3>
              <button onClick={() => setShowConfirmModal(false)}>
                <X size={24} />
              </button>
            </div>
            <p className="mb-4">{actionToConfirm?.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;