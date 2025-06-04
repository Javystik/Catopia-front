import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserById, updateUser, updateUserAvatar } from '../api/userApi';
import { getAllFoldersByUserId, createFolder, updateFolder, deleteFolder } from '../api/folderApi';
import { getAllFolderNovelsByFolderId, deleteFolderNovel } from '../api/folderNovelApi';
import { getNovelsByUserId, deleteNovelById } from '../api/novelApi';
import { getReviewByUserId, deleteReview } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useNotification } from '../components/NotificationProvider';

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderNovels, setFolderNovels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderNovelCounts, setFolderNovelCounts] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderType, setFolderType] = useState('READING');
  const [userNovels, setUserNovels] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [viewMode, setViewMode] = useState('folders');
  const [error, setError] = useState(null);
  const [folderNameError, setFolderNameError] = useState(null);
  const { user: authUser, loading } = useAuth();
  const { notify } = useNotification();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const fileInputRef = useRef(null);

  const FolderType = {
    READING: 'Читаю',
    PLAN_TO_READ: 'Планую прочитати',
    COMPLETED: 'Прочитано',
    PAUSED: 'Призупинено',
    DROPPED: 'Закинуто'
  };

  const isDefaultFolder = (folderName) => {
    return Object.values(FolderType).includes(folderName);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        setNewUsername(userData.username);
      } catch (error) {
        console.error('Failed to load user:', error);
        setError('Не вдалося завантажити дані користувача');
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchFoldersAndCounts = async () => {
      try {
        const folderData = await getAllFoldersByUserId(userId);
        setFolders(folderData);

        const counts = {};
        for (const folder of folderData) {
          const novelsData = await getAllFolderNovelsByFolderId(folder.id);
          counts[folder.id] = novelsData.length;
        }
        setFolderNovelCounts(counts);

        if (folderData.length > 0) {
          setSelectedFolder(folderData[0].id);
        }
      } catch (error) {
        console.error('Failed to load folders or novel counts:', error);
        setError('Не вдалося завантажити папки');
      }
    };
    fetchFoldersAndCounts();
  }, [userId]);

  useEffect(() => {
    const fetchFolderNovels = async () => {
      if (selectedFolder && viewMode === 'folders') {
        try {
          const novelsData = await getAllFolderNovelsByFolderId(selectedFolder);
          setFolderNovels(novelsData);
        } catch (error) {
          console.error('Failed to load folder novels:', error);
          setError('Не вдалося завантажити новели папки');
        }
      }
    };
    fetchFolderNovels();
  }, [selectedFolder, viewMode]);

  useEffect(() => {
    const fetchUserNovels = async () => {
      if (viewMode === 'works') {
        try {
          const novels = await getNovelsByUserId(userId);
          setUserNovels(Array.isArray(novels) ? novels : []);
          setError(null);
        } catch (error) {
          console.error('Failed to load user novels:', error);
          setError('Не вдалося завантажити роботи користувача');
          setUserNovels([]);
        }
      }
    };
    fetchUserNovels();
  }, [userId, viewMode]);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (viewMode === 'reviews') {
        try {
          const reviews = await getReviewByUserId(userId);
          setUserReviews(Array.isArray(reviews) ? reviews : []);
          setError(null);
        } catch (error) {
          console.error('Failed to load user reviews:', error);
          setError('Не вдалося завантажити відгуки користувача');
          setUserReviews([]);
        }
      }
    };
    fetchUserReviews();
  }, [userId, viewMode]);

  const filteredNovels = folderNovels.filter(novel =>
    (novel.latestChapterTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     novel.novelName?.toLowerCase().includes(searchTerm.toLowerCase())) ??
    true
  );

  const filteredWorks = userNovels.filter(novel =>
    (novel.titleUk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     novel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     novel.novelName?.toLowerCase().includes(searchTerm.toLowerCase())) ??
    true
  );

  const filteredReviews = userReviews.filter(review =>
    (review.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     review.title?.toLowerCase().includes(searchTerm.toLowerCase())) ??
    true
  );

  const handleFolderClick = (folderId) => {
    setSelectedFolder(folderId);
    setSearchTerm('');
    setViewMode('folders');
    setError(null);
  };

  const handleDeleteNovel = async (novelId) => {
    if (selectedFolder) {
      try {
        await deleteFolderNovel(selectedFolder, novelId);
        setFolderNovels(folderNovels.filter(novel => novel.id.novelId !== novelId));
        setFolderNovelCounts(prev => ({
          ...prev,
          [selectedFolder]: prev[selectedFolder] - 1
        }));
        notify('success', 'Новелу успішно видалено зі списку!');
      } catch (error) {
        console.error('Failed to delete folder novel:', error);
        setError('Не вдалося видалити новелу з папки');
      }
    }
  };

  const handleDeleteUserNovel = async (novelId) => {
    try {
      await deleteNovelById(novelId);
      setUserNovels(userNovels.filter(novel => novel.id !== novelId));
      notify('success', 'Новелу успішно видалено!');
    } catch (error) {
      console.error('Failed to delete novel:', error);
      notify('error', 'Помилка при видаленні новели');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setUserReviews(userReviews.filter(review => review.id !== reviewId));
      notify('success', 'Відгук успішно видалено!');
    } catch (error) {
      console.error('Failed to delete review:', error);
      notify('error', 'Помилка при видаленні відгуку');
    }
  };

  const validateFolderName = (name) => {
    if (!name.trim()) {
      return 'Назва папки не може бути порожньою';
    }
    if (name.length > 50) {
      return 'Назва папки не може бути довшою за 50 символів';
    }
    if (folders.some(folder => folder.name.toLowerCase() === name.toLowerCase() && 
        (!editingFolder || folder.id !== editingFolder.id))) {
      return 'Папка з такою назвою вже існує';
    }
    if (isDefaultFolder(name)) {
      return 'Назва папки не може збігатися з назвою стандартних папок';
    }
    return null;
  };

  const handleCreateFolder = async () => {
    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      setFolderNameError(validationError);
      return;
    }

    try {
      const folderDTO = {
        userId: userId,
        name: newFolderName,
        type: folderType,
      };
      const newFolder = await createFolder(folderDTO);
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setIsEditModalOpen(false);
      setFolderNameError(null);
      notify('success', 'Папку успішно створено!');
    } catch (error) {
      console.error('Failed to create folder:', error);
      setError('Не вдалося створити папку');
    }
  };

  const handleEditFolder = (folder) => {
    if (!isDefaultFolder(folder.name)) {
      setEditingFolder({ ...folder });
      setNewFolderName(folder.name);
      setFolderType(folder.type || 'READING');
      setIsEditModalOpen(true);
      setFolderNameError(null);
    }
  };

  const handleUpdateFolder = async () => {
    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      setFolderNameError(validationError);
      return;
    }

    if (editingFolder) {
      try {
        const folderDTO = {
          name: newFolderName,
          type: folderType,
        };
        const updatedFolder = await updateFolder(editingFolder.id, folderDTO);
        setFolders(folders.map(f => f.id === updatedFolder.id ? updatedFolder : f));
        setEditingFolder(null);
        setNewFolderName('');
        setIsEditModalOpen(false);
        setFolderNameError(null);
        notify('success', 'Папку успішно оновлено!');
      } catch (error) {
        console.error('Failed to update folder:', error);
        setError('Не вдалося оновити папку');
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className.includes('fixed')) {
      setIsEditModalOpen(false);
      setEditingFolder(null);
      setNewFolderName('');
      setFolderNameError(null);
    }
  };

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isEditModalOpen]);

  const handleDeleteFolder = async (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder && !isDefaultFolder(folder.name)) {
      try {
        await deleteFolder(folderId);
        setFolders(folders.filter(f => f.id !== folderId));
        if (selectedFolder === folderId) {
          setSelectedFolder(folders[0]?.id || null);
        }
        setFolderNovelCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[folderId];
          return newCounts;
        });
        notify('success', 'Папку успішно видалено!');
      } catch (error) {
        console.error('Failed to delete folder:', error);
        setError('Не вдалося видалити папку');
      }
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const updatedUser = await updateUserAvatar(userId, file);
        setUser((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
        notify('success', 'Аватар успішно оновлено!');
      } catch (error) {
        console.error('Failed to update avatar:', error);
        notify('error', 'Помилка при оновленні аватара');
      }
    }
  };

  const handleUsernameClick = () => {
    if (isOwnProfile) {
      setIsEditingUsername(true);
    }
  };

  const handleUsernameChange = async () => {
    if (newUsername.trim() && newUsername !== user.username) {
      try {
        const userDTO = { username: newUsername };
        const updatedUser = await updateUser(userId, userDTO);
        setUser((prev) => ({ ...prev, username: updatedUser.username }));
        setIsEditingUsername(false);
        notify('success', 'Ім\'я користувача успішно оновлено!');
      } catch (error) {
        console.error('Failed to update username:', error);
        notify('error', 'Помилка при оновленні імені користувача');
      }
    } else {
      setIsEditingUsername(false);
    }
  };

  const handleUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUsernameChange();
    } else if (e.key === 'Escape') {
      setIsEditingUsername(false);
      setNewUsername(user.username);
    }
  };

  const isOwnProfile = authUser && authUser.id === Number(userId);

  if (!user) {
    return <div className="text-center mt-10">Завантаження...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800 px-4 sm:px-[10%] py-6 flex flex-col sm:flex-row">
      <div className="w-full sm:w-1/5 flex flex-col space-y-4 mb-6 sm:mb-0">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="relative w-[52px] h-[52px] rounded-md overflow-hidden cursor-pointer">
              <img
                src={user.avatarUrl || '/images/user_avatar.png'}
                alt="User avatar"
                className="w-full h-full object-cover"
                title={isOwnProfile ? 'Змінити аватар' : ''}
              />
              {isOwnProfile && (
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              )}
            </div>
            <div className="ml-4 -mt-1">
              {isEditingUsername ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onBlur={handleUsernameChange}
                  onKeyDown={handleUsernameKeyPress}
                  className="text-sm font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                  autoFocus
                />
              ) : (
                <h2
                  className={`text-sm font-semibold leading-tight text-gray-800 ${
                    isOwnProfile ? 'cursor-pointer hover:text-blue-600 transition' : ''
                  }`}
                  onClick={handleUsernameClick}
                  title={isOwnProfile ? 'Змінити ім\'я користувача' : ''}
                >
                  {user.username}
                </h2>
              )}
              <p className="text-xs text-gray-500 mt-[2px]">
                Долучився: {new Date(user.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col space-y-1">
            {folders.map(folder => (
              <div key={folder.id} className="flex items-center justify-between">
                <button
                  onClick={() => handleFolderClick(folder.id)}
                  className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm transition 
                    ${
                      selectedFolder === folder.id && viewMode === 'folders'
                        ? 'bg-gray-200 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                >
                  <span className="truncate text-left">{folder.name}</span>
                  <span className="text-gray-500 text-xs">
                    {folderNovelCounts[folder.id] || 0}
                  </span>
                </button>
              </div>
            ))}
          </div>

          {!loading && authUser && authUser.id === Number(userId) && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex justify-between items-center w-full px-3 py-2 rounded-md text-sm transition hover:bg-gray-100 font-semibold mt-2"
              title="Редагувати папки"
            >
              <span className="truncate text-left">Редагування...</span>
              <span className="text-gray-500 text-xs">✏️</span>
            </button>
          )}

          <button
            onClick={() => {
              setViewMode('works');
              setSearchTerm('');
              setError(null);
            }}
            className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm transition 
              ${viewMode === 'works' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
            title="Мої роботи"
          >
            <span className="truncate text-left">Мої роботи</span>
            <span className="text-gray-500 text-xs">📚</span>
          </button>
          <button
            onClick={() => {
              setViewMode('reviews');
              setSearchTerm('');
              setError(null);
            }}
            className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm transition 
              ${viewMode === 'reviews' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
            title="Мої відгуки"
          >
            <span className="truncate text-left">Мої відгуки</span>
            <span className="text-gray-500 text-xs">⭐</span>
          </button>
        </div>
      </div>

      <div className="w-full sm:w-4/5 sm:ml-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 h-[86px] flex items-center px-4">
          <input
            type="text"
            placeholder="Фільтр по назві..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-500 text-center py-6">{error}</p>
        )}

        {viewMode === 'folders' && !error && (
          <div className="space-y-2">
            {filteredNovels.length > 0 ? (
              filteredNovels.map((novel) => (
                <Link
                  key={novel.novelId}
                  to={`/novel/${novel.novelId}/${novel.novelSlug}`}
                  className="block"
                >
                  <div
                    className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow hover:shadow-md transition"
                  >
                    <div className="flex items-start w-full sm:w-auto">
                      <img
                        src={novel.coverUrl || '/images/default_novel.png'}
                        alt="Novel cover"
                        className="w-[65px] h-[100px] object-cover rounded-md mr-4"
                      />
                      <div className="flex flex-col justify-between">
                        <h3 className="text-[15px] font-semibold text-gray-900 leading-tight mb-1 line-clamp-1">
                          {novel.novelName || 'Без назви'}
                        </h3>
                        <p className="text-sm text-gray-700 mb-1 line-clamp-1">
                          Остання глава: {novel.chapterCount || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          Продовжити [{novel.readFrom || 0}–{novel.chapterCount || 0}]
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-sm text-gray-500 w-full sm:w-[100px] mt-2 sm:mt-0">
                      <div className="text-[13px] leading-tight text-center">Додано:</div>
                      <div className="text-[14px] font-medium leading-tight text-center">
                        {new Date(novel.createdAt).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteNovel(novel.id.novelId);
                        }}
                        className="absolute top-3 right-3 p-1 bg-white/80 backdrop-blur-md text-gray-500 hover:text-red-500 hover:scale-110 transition-all rounded-full shadow-md"
                        title="Видалити новелу з папки"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                Немає новел у цьому списку
              </p>
            )}
          </div>
        )}

        {viewMode === 'works' && !error && (
          <div className="space-y-2">
            {filteredWorks.length > 0 ? (
              filteredWorks.map((novel) => (
                <Link
                  key={novel.id}
                  to={`/novel/${novel.id}/${novel.slug}`}
                  className="block"
                >
                  <div
                    className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow hover:shadow-md transition"
                  >
                    <div className="flex items-start w-full sm:w-auto">
                      <img
                        src={novel.coverUrl || '/images/default_novel.png'}
                        alt="Novel cover"
                        className="w-[65px] h-[100px] object-cover rounded-md mr-4"
                      />
                      <div className="flex flex-col justify-between">
                        <h3 className="text-[15px] font-semibold text-gray-900 leading-tight mb-1 line-clamp-1">
                          {novel.titleUk || 'Без назви'}
                        </h3>
                        <p className="text-sm text-gray-700 mb-1 line-clamp-1">
                          Глав: {novel.chapterCount || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          Статус: {novel.status || 'Невідомо'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-sm text-gray-500 w-full sm:w-[100px] mt-2 sm:mt-0">
                      <div className="text-[13px] leading-tight text-center">Створено:</div>
                      <div className="text-[14px] font-medium leading-tight text-center">
                        {new Date(novel.createdAt).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteUserNovel(novel.id);
                        }}
                        className="absolute top-3 right-3 p-1 bg-white/80 backdrop-blur-md text-gray-500 hover:text-red-500 hover:scale-110 transition-all rounded-full shadow-md"
                        title="Видалити новелу"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                Немає створених робіт
              </p>
            )}
          </div>
        )}

        {viewMode === 'reviews' && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const sentimentColor =
                  review.sentiment === 'Позитивний'
                    ? 'text-green-600'
                    : review.sentiment === 'Негативний'
                    ? 'text-red-600'
                    : 'text-gray-500';

                return (
                  <Link
                    key={review.id}
                    to={`/review/${review.id}`}
                    className="block relative bg-white rounded-xl border border-gray-200 shadow hover:shadow-md transition flex-col overflow-hidden"
                  >
                    <img
                      src={review.imageNovelUrl || '/images/default_novel.png'}
                      alt="Novel banner"
                      className="w-full h-[140px] object-cover"
                    />

                    <div className="p-4 flex flex-col flex-grow justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M7 8h10M7 12h4m1 8.5c-.8.3-1.5.5-2.5.5-4.5 0-8-3.6-8-8 0-4.5 3.6-8 8-8 4.5 0 8 3.6 8 8 0 2-.7 3.8-2 5.2L19 21l-4.5-1.5z"/>
                          </svg>
                          Відгук
                        </span>
                        <span className={`flex items-center gap-1 font-medium ${sentimentColor}`}>
                          ● {review.sentiment}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-semibold text-gray-900 mb-1 line-clamp-1">
                        {review.title || 'Без назви'}
                      </h3>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {review.text || 'Без тексту'}
                      </p>

                      <div className="flex items-center justify-between text-gray-400 text-sm">
                        <div className="flex gap-4 items-center">
                          <span className="flex items-center gap-1">
                            <span className="text-base">👁️</span>
                            {review.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-base">❤️</span>
                            {review.likes || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: uk })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Link
                          to={`/editReview/${review.novelId}/${review.titleSlug}/${encodeURIComponent(review.titleName)}/${review.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 bg-white/80 backdrop-blur-md text-gray-500 hover:text-blue-500 hover:scale-110 transition-all rounded-full shadow-md"
                          title="Редагувати відгук"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteReview(review.id);
                          }}
                          className="p-1 bg-white/80 backdrop-blur-md text-gray-500 hover:text-red-500 hover:scale-110 transition-all rounded-full shadow-md"
                          title="Видалити відгук"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-6 col-span-full">Немає відгуків</p>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-start sm:items-center pt-6 sm:pt-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleOverlayClick}
        >
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-md mx-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Редагування списків</h2>
            <div className="mb-4 sm:mb-5">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setFolderNameError(validateFolderName(e.target.value));
                }}
                placeholder="Назва папки"
                className={`w-full px-4 py-2 sm:py-3 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition
                  ${folderNameError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
              {folderNameError && (
                <p className="text-red-500 text-xs mt-1">{folderNameError}</p>
              )}
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип папки:</label>
              <select
                value={folderType}
                onChange={(e) => setFolderType(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                {Object.entries(FolderType).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
              <button
                onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                className={`w-full sm:w-auto px-4 sm:px-5 py-2 rounded-lg text-white transition
                  ${folderNameError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={!!folderNameError}
              >
                {editingFolder ? 'Зберегти' : 'Створити'}
              </button>

              {editingFolder && (
                <button
                  onClick={() => handleDeleteFolder(editingFolder.id)}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Видалити
                </button>
              )}
            </div>

            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 rounded-lg border border-gray-200">
              {folders.map(folder => (
                <li
                  key={folder.id}
                  className="flex justify-between items-center py-2 px-3 sm:px-4 hover:bg-gray-50"
                >
                  <span className="text-gray-800 truncate">{folder.name}</span>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => handleEditFolder(folder)}
                      className={`text-blue-500 hover:text-blue-700 transition ${isDefaultFolder(folder.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isDefaultFolder(folder.name)}
                      title="Редагувати"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className={`text-red-500 hover:text-red-700 transition ${isDefaultFolder(folder.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isDefaultFolder(folder.name)}
                      title="Видалити"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;