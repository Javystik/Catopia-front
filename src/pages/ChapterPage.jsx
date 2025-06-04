import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookmark,
  FaShareAlt,
  FaEllipsisV,
  FaHeart,
} from "react-icons/fa";
import Comments from "../components/Comments";
import { findChapterByVolumeAndChapterNumber, getPreviousChapter, getNextChapter } from "../api/chapterApi";

const ChapterPage = () => {
  const { novelId, slug, volume, chapter } = useParams();
  const location = useLocation();

  const [prevChapter, setPrevChapter] = useState(null);
  const [nextChapter, setNextChapter] = useState(null);

  const [chapterData, setChapterData] = useState(null);
  const [titleUk] = useState(location.state?.titleUk);
  const [titleEn] = useState(location.state?.titleEn);
  const [likes, setLikes] = useState(77);

  useEffect(() => {
    const fetchChapterData = async () => {
      const chapterInfo = await findChapterByVolumeAndChapterNumber(novelId, volume, chapter);
      setChapterData(chapterInfo);

      const [prev, next] = await Promise.all([
        getPreviousChapter(novelId, volume, chapter),
        getNextChapter(novelId, volume, chapter),
      ]);
      setPrevChapter(prev);
      setNextChapter(next);
    };

    fetchChapterData();
  }, [volume, chapter, novelId]);

  const handleLike = () => {
    setLikes(likes + 1);
  };

  if (!chapterData) {
    return <div className="text-[#212529] text-center">Глава не знайдена!</div>;
  }

  return (
    <div className="min-h-screen flex flex-col text-[#212529] bg-white">
      <header className="bg-[#e0f2ff] px-4 flex items-center shadow-md h-[48px] md:h-[56px]">
        <div className="flex items-center justify-center h-full w-10 rounded hover:bg-[#d1e7ff] transition-colors duration-200 cursor-pointer md:w-12">
          <Link to={`/novel/${novelId}/${slug}#chapters`} className="flex items-center justify-center h-full w-full">
            <FaArrowLeft className="text-[#6c757d] hover:text-[#212529] text-lg md:text-xl" />
          </Link>
        </div>

        <Link to={`/novel/${novelId}/${slug}#about`} className="hidden md:flex items-center h-full px-3 rounded hover:bg-[#d1e7ff] transition-colors duration-200 cursor-pointer">
          <div>
            <p className="text-[#6c757d] text-xs">{titleEn} [Novel]</p>
            <p className="text-[#212529] text-[14px] font-medium">{titleUk} [Новелла]</p>
          </div>
        </Link>

        <div className="flex items-center space-x-1 md:space-x-2 h-full ml-2 md:ml-0">
          {prevChapter ? (
            <Link
              to={`/chapter/${novelId}/${slug}/v/${prevChapter.volumeNumber}/c/${prevChapter.chapterNumber}`}
              state={{ titleUk, titleEn }}
              className="flex items-center justify-center h-full w-10 rounded hover:bg-[#d1e7ff] transition-colors duration-200 md:w-12"
            >
              <FaArrowLeft className="text-[#6c757d] hover:text-[#212529] text-lg md:text-xl" />
            </Link>
          ) : (
            <div className="w-10 md:w-12" />
          )}

          <Link
            to={`/novel/${novelId}/${slug}#chapters`}
            className="flex flex-col items-center justify-center h-full px-2 rounded hover:bg-[#d1e7ff] transition-colors duration-200 cursor-pointer"
          >
            <span className="text-[#6c757d] text-[10px] md:text-[12px]">Зміст</span>
            <h1 className="text-[12px] md:text-[14px] font-medium text-[#212529]">
              Том {volume} Глава {chapter}
            </h1>
          </Link>

          {nextChapter ? (
            <Link
              to={`/chapter/${novelId}/${slug}/v/${nextChapter.volumeNumber}/c/${nextChapter.chapterNumber}`}
              state={{ titleUk, titleEn }}
              className="flex items-center justify-center h-full w-10 rounded hover:bg-[#d1e7ff] transition-colors duration-200 md:w-12"
            >
              <FaArrowRight className="text-[#6c757d] hover:text-[#212529] text-lg md:text-xl" />
            </Link>
          ) : (
            <div className="w-10 md:w-12" />
          )}
        </div>

        <div className="flex items-center space-x-2 h-full ml-auto text-sm md:text-base">
          {[FaBookmark, FaShareAlt, FaEllipsisV].map((Icon, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-full w-10 rounded hover:bg-[#d1e7ff] transition-colors duration-200 cursor-pointer md:w-12"
            >
              <Icon className="text-[#6c757d] hover:text-[#212529] cursor-pointer text-lg md:text-xl" />
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-3 text-[#212529] md:px-[16px]">
        <h1 className="text-xl font-medium mb-4 text-center md:text-2xl">
          Том {volume} Глава {chapter} — {chapterData.title}
        </h1>
        <div className="mx-auto w-full max-w-[90%] md:max-w-[60%]">
          <div
            className="text-[14px] leading-relaxed md:text-[16px]"
            dangerouslySetInnerHTML={{ __html: chapterData.content }}
          />
        </div>
      </main>

      <div className="bg-white px-4 py-3 md:px-[16px]">
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-2xl shadow-md hover:bg-red-600 transition-colors duration-200 text-sm md:text-base"
          >
            <FaHeart className="text-white text-lg md:text-xl" />
            <span className="font-medium">Подякувати</span>
          </button>
        </div>

        <div className="flex justify-between">
          {prevChapter ? (
            <Link to={`/chapter/${novelId}/${slug}/v/${prevChapter.volumeNumber}/c/${prevChapter.chapterNumber}`} state={{ titleUk, titleEn }}>
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200 md:px-4 md:py-2 md:text-base">
                Назад
              </button>
            </Link>
          ) : <div />}

          {nextChapter ? (
            <Link to={`/chapter/${novelId}/${slug}/v/${nextChapter.volumeNumber}/c/${nextChapter.chapterNumber}`} state={{ titleUk, titleEn }}>
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200 md:px-4 md:py-2 md:text-base">
                Вперед
              </button>
            </Link>
          ) : <div />}
        </div>
      </div>

      <footer className="bg-white px-4 py-3 md:px-[16px] mt-auto">
        <div className="max-w-[90%] md:max-w-[60%] mx-auto text-[#212529]">
          <Comments chapterId={chapterData.id}/>
        </div>
      </footer>
    </div>
  );
};

export default ChapterPage;