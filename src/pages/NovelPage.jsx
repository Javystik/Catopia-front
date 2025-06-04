import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NovelDetails from "../components/novelPage/NovelDetails";
import NovelChapters from "../components/novelPage/NovelChapters";
import ReviewList from "../components/novelPage/ReviewList";
import Comments from "../components/Comments";
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';
import { getNovelById } from "../api/novelApi";
import { getAllFoldersByUserId } from "../api/folderApi";
import { createFolderNovel } from "../api/folderNovelApi";
import { getFolderNovelsByNovelIdAndUserId } from "../api/folderNovelApi";
import { useNotification } from '../components/NotificationProvider';

const tabs = ["Про тайтл", "Глави", "Коментарі", "Відгуки"];

const tabAliases = {
  "Про тайтл": "about",
  Глави: "chapters",
  Коментарі: "comments",
  Відгуки: "reviews",
};

const aliasToTab = {
  about: "Про тайтл",
  chapters: "Глави",
  comments: "Коментарі",
  reviews: "Відгуки",
};

const NovelPage = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllAltNames, setShowAllAltNames] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [novelData, setNovelData] = useState(null);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { novelId, novelSlug } = useParams();
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const maxLength = 300;
  const { user, loading } = useAuth();
  const dropdownRef = useRef(null);
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState(() => {
    const hash = location.hash.substring(1);
    return aliasToTab[hash] || "Про тайтл";
  });
  
  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const data = await getNovelById(novelId);
        if (!data || !data.slug) {
          return;
        }
        if (data.slug !== novelSlug) {
          navigate(`/novel/${novelId}/${data.slug}${location.hash}`, { replace: true });
          return;
        }
        setNovelData(data);
      } catch (error) {
        console.error("Fetch error:", {
          status: error.response?.status,
          message: error.message,
        });
      }
    };

    fetchNovel();
  }, [novelId, novelSlug, navigate, location.hash]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        if (user?.id) {
          const folderData = await getAllFoldersByUserId(user.id);
          setFolders(folderData || []);
        }
      } catch (error) {
        console.error('Failed to load folders:', error);
        setFolders([]);
      }
    };
    if (!loading && user?.id) {
      fetchFolders();
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchFolderNovel = async () => {
      try {
        if (user?.id && novelId) {
          const folderNovelData = await getFolderNovelsByNovelIdAndUserId(novelId, user.id);
          if (!folderNovelData || (Array.isArray(folderNovelData) && folderNovelData.length === 0)) {
            setCurrentFolder(null);
          } else {
            const folder = Array.isArray(folderNovelData) ? folderNovelData[0] : folderNovelData;
            setCurrentFolder({
              folder: {
                id: folder.folderId,
                name: folder.folderName,
                type: folder.type || 'unknown',
              },
              novelId: folder.novelId || novelId,
              novelName: folder.novelName || novelData?.titleUk,
              coverUrl: folder.coverUrl || novelData?.coverUrl,
              folderName: folder.folderName || 'Unknown Folder',
              userId: user.id,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load folder novel:', error);
        setCurrentFolder(null);
      }
    };
    if (!loading && user?.id) {
      fetchFolderNovel();
    }
  }, [user, novelId, loading, novelData]);

  useEffect(() => {
    const hash = location.hash.substring(1);
    if (aliasToTab[hash]) {
      setActiveTab(aliasToTab[hash]);
    }
  }, [location]);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      const { offsetWidth, offsetLeft } = activeTabElement;
      setIndicatorStyle({
        width: offsetWidth,
        left: offsetLeft,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`#${tabAliases[tab]}`);
  };

  const handleAddToFolder = async (folderId) => {
    if (!novelId || !folderId) return;
    try {
      const folderNovelDTO = {
        folderId: folderId,
        novelId: novelId,
        novelName: novelData.titleUk,
        coverUrl: novelData.coverUrl,
        userId: user.id,
      };
      await createFolderNovel(folderNovelDTO);

      const folderNovelData = await getFolderNovelsByNovelIdAndUserId(novelId, user.id);
      if (folderNovelData && Array.isArray(folderNovelData) && folderNovelData.length > 0) {
        const folder = folderNovelData[0];
        setCurrentFolder({
          folder: {
            id: folder.folderId,
            name: folder.folderName,
            type: folder.type || 'unknown',
          },
          novelId: folder.novelId || novelId,
          novelName: folder.novelName || novelData?.titleUk,
          coverUrl: folder.coverUrl || novelData?.coverUrl,
          folderName: folder.folderName || 'Unknown Folder',
          userId: user.id,
        });
      } else {
        console.log('No folder novel data after adding, setting currentFolder to null');
        setCurrentFolder(null);
      }
      setIsDropdownOpen(false);
      notify('success', 'Новелу успішно додано до папки!');
    } catch (error) {
      console.error('Помилка при додаванні до папки:', error);
      notify('error', 'Не вдалося додати новелу до папки.');
    }
  };

  const handleLoginRedirect = () => {
    notify('error', 'Увійдіть, щоб додати новелу до планів.');
    navigate('/login');
  };

  if (!novelData) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFAB40]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{novelData.titleUk} / {novelData.titleEn}</title>
      </Helmet>

      <div className="mx-[9%] mt-1 rounded-xl overflow-hidden relative hidden md:block">
        <img src={novelData.bannerUrl} alt="Banner" className="object-cover w-full h-95" />

        <div className="absolute bottom-2 left-[23.5%]">
          <h1 className="text-[24px] font-bold text-white drop-shadow-md">{novelData.titleUk}</h1>
          <p className="text-[18px] text-white drop-shadow-md">{novelData.titleEn}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mx-[10%] mt-4 gap-8">
        <div className="w-full md:w-[20%] shrink-0 relative -mt-24 z-10">
          <div className="relative w-full h-[364px] rounded-md shadow-lg">
            <img
              src={novelData.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              {user?.id === novelData.author.id && (
                <Link
                  to={`/createChapter/${novelData.id}/${novelData.slug}/${novelData.titleUk}`}
                  className="relative cursor-pointer rounded-full p-2 shadow-md group inline-block"
                  aria-label="Створення глави"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 384 512"
                  >
                    <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                  </svg>
                  <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                    Створення глави
                  </span>
                </Link>
              )}

              <Link
                to={`/createTitle/${novelData.id}`}
                className="relative cursor-pointer rounded-full p-2 shadow-md group inline-block"
                aria-label="Редагувати обкладинку"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 384 512"
                >
                  <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM325.8 139.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-21.4 21.4-71-71 21.4-21.4c15.6-15.6 40.9-15.6 56.6 0zM119.9 289L225.1 183.8l71 71L190.9 359.9c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z" />
                </svg>
                <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                  Редагування тайтлу
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-4 relative" ref={dropdownRef}>
            {loading ? (
              <div className="w-full flex justify-center items-center p-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FFAB40]"></div>
              </div>
            ) : (
              <>
                {user?.id && (
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-[#FFAB40] text-white p-2 rounded-lg hover:bg-[#e59435] transition-all duration-200 shadow-md"
                  >
                    <span className="truncate">
                      {currentFolder?.folderName || "+ Додати в плани"}
                    </span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                {isDropdownOpen && user?.id && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-20 animate-slide-up max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {folders.length > 0 ? (
                      folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer text-sm transition-colors duration-200 border-b border-gray-100 last:border-b-0 flex items-center gap-2 text-gray-800 hover:text-[#FFAB40]"
                          onClick={() => handleAddToFolder(folder.id)}
                        >
                          <span className="truncate">{folder.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">
                        Немає доступних папок
                      </div>
                    )}
                  </div>
                )}
                {!user?.id && (
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full flex items-center justify-between bg-gray-300 text-gray-800 p-2 rounded-lg shadow-md"
                  >
                    <span>Увійти, щоб додати в плани</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mt-4 bg-white p-2 rounded-xl shadow text-sm hidden md:block">
            {[
              { label: "Тип", value: novelData.type },
              { label: "Випуск", value: novelData.releaseYear },
              { label: "Глав", value: novelData.chapterCount },
              { label: "Статус", value: novelData.status },
              { label: "Автор", value: novelData.author.username, isAuthor: true },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg hover:bg-gray-100 cursor-pointer transition py-1 px-2"
              >
                <div className="text-[13px] text-[#8A8A8E]">{item.label}</div>
                <div className="text-[14px] text-[#212529]">
                  {item.isAuthor ? (
                    <Link
                      to={`/profile/${novelData.author.id}`}
                      className="hover:underline"
                    >
                      {item.value}
                    </Link>
                  ) : (
                    item.value
                  )}
                </div>
              </div>
            ))}

            <div
              className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
              onClick={() => setShowAllAltNames(!showAllAltNames)}
            >
              <div className="text-[13px] text-[#8A8A8E]">Альтернативні назви</div>
              <div className="flex flex-col text-[14px] text-[#212529]">
                {(showAllAltNames ? novelData.altTitles : novelData.altTitles.slice(0, 1)).map((name) => (
                  <span key={name}>{name}</span>
                ))}
                {novelData.altTitles.length > 1 && (
                  <span className="text-gray-500 text-sm mt-1">
                    {showAllAltNames ? "Сховати" : "Показати ще..."}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl p-6 py-3 self-start">
          <div className="relative flex gap-4 font-semibold text-[#222529] border-b border-gray-200">
            {tabs.map((tab) => (
              <span
                key={tab}
                ref={(el) => (tabRefs.current[tab] = el)}
                className={`cursor-pointer pb-1 ${activeTab === tab ? "text-[#222529]" : "text-gray-400"}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </span>
            ))}
            <div
              className="absolute bottom-0 h-[3px] bg-[#FFAB40] transition-all duration-300 ease-in-out"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
              }}
            />
          </div>

          <div className="pt-4">
            {activeTab === "Про тайтл" && (
              <NovelDetails
                novel={novelData}
                isExpanded={isExpanded}
                toggleDescription={toggleDescription}
                showAllTags={showAllTags}
                setShowAllTags={setShowAllTags}
                maxLength={maxLength}
              />
            )}
            {activeTab === "Глави" && (
              Array.isArray(novelData.chapters) ? (
                <NovelChapters
                  chaptersList={novelData.chapters}
                  novelSlug={novelData.slug}
                  novelId={novelData.id}
                  titleUk={novelData.titleUk}
                  titleEn={novelData.titleEn}
                />
              ) : (
                <div>Немає доступних глав</div>
              )
            )}
            {activeTab === "Коментарі" && (
              <div className="max-w-4xl mx-auto px-4 w-full">
                <Comments novelId={novelId} />
              </div>
            )}

            {activeTab === "Відгуки" && (
              <ReviewList 
                novelId={novelId}
                novelSlug = {novelData.slug}
                novelName = {novelData.titleUk} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelPage;