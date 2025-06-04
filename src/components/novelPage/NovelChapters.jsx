import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../components/NotificationProvider';
import { deleteChapter } from "../../api/chapterApi";

const NovelChapters = ({ chaptersList, novelSlug, novelId, titleUk, titleEn }) => {
  const [sortOrder, setSortOrder] = useState("desc");
  const [chapters, setChapters] = useState(chaptersList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterIdToDelete, setChapterIdToDelete] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useNotification();
  const modalRef = useRef(null);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const sortedChapters = [...chapters].sort((a, b) => {
    const volumeA = a.volumeNumber;
    const volumeB = b.volumeNumber;
    
    const chapterA = a.chapterNumber;
    const chapterB = b.chapterNumber;
  
    if (volumeA !== volumeB) {
      return sortOrder === "desc" ? volumeB - volumeA : volumeA - volumeB;
    } else {
      return sortOrder === "desc" ? chapterB - chapterA : chapterA - chapterB;
    }
  });

  const handleDownload = () => {
    alert("Функція скачування в розробці!");
  };

  const handleEditClick = (chapterId) => {
    navigate(`/createChapter/${novelId}/${novelSlug}/${titleUk}/${chapterId}`);
  };

  const handleDeleteClick = (chapterId) => {
    if (!user?.id) {
      notify('error', 'Увійдіть, щоб видалити главу.');
      navigate('/login');
      return;
    }
    setChapterIdToDelete(chapterId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteChapter(chapterIdToDelete);
      setChapters(chapters.filter(chapter => chapter.id !== chapterIdToDelete));
      notify('success', 'Главу успішно видалено!');
    } catch (error) {
      console.error('Помилка при видаленні глави:', error);
      notify('error', 'Не вдалося видалити главу.');
    } finally {
      setIsModalOpen(false);
      setChapterIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setChapterIdToDelete(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCancelDelete();
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition transform hover:scale-105 active:scale-95 duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h13M3 8h9M3 12h6m-6 4h3m5-12v16m-5-4l4 4m0 0l4-4m-4 4V4"
              />
            </svg>
            <span>Сортувати</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition transform hover:scale-105 active:scale-95 duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Скачати</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sortedChapters.map((chapter, index) => (
          <Link
            key={index}
            to={`/chapter/${novelId}/${novelSlug}/v/${chapter.volumeNumber}/c/${chapter.chapterNumber}`}
            state={{ chapter, chaptersList: sortedChapters, currentIndex: index, titleUk, titleEn }}
            className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-[#212529]">
                Том {chapter.volumeNumber} Глава {chapter.chapterNumber} — {chapter.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#212529] text-sm">{chapter.releaseDate}</span>
              
              {user?.id === chapter.userId && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditClick(chapter.id);
                    }}
                    className="text-orange-500 text-xl transform transition-transform duration-200 hover:scale-125"
                    title="Редагувати главу"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(chapter.id);
                    }}
                    className="text-red-500 text-xl transform transition-transform duration-200 hover:scale-125"
                    title="Видалити главу"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-slide-up"
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <h2 id="modal-title" className="text-lg font-semibold text-[#212529] mb-4">
              Підтвердження видалення
            </h2>
            <p id="modal-description" className="text-sm text-gray-600 mb-6">
              Ви впевнені, що хочете видалити цю главу? Цю дію не можна скасувати.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelChapters;