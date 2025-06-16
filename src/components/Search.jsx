import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getNovelLightsByTitle } from "../api/novelApi";

const MotionDiv = motion.div;

const Search = ({
  show,
  onClose,
  placeholder,
  tabs,
  activeTab,
  setActiveTab,
  extendedText,
  link,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setSearchQuery("");
      setSearchResults([]);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose]);

  useEffect(() => {
    let timeoutId;
    const fetchResults = async () => {
      if (activeTab === "Тайтли" && searchQuery.trim().length >= 3) { // Check for at least 3 characters
        setIsLoading(true);
        setError(null);
        try {
          const results = await getNovelLightsByTitle(searchQuery);
          setSearchResults(results);
        } catch {
          setError("Не вдалося виконати пошук. Спробуйте ще раз.");
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    timeoutId = setTimeout(fetchResults, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  if (!show && !isClosing) return null;

  const handleLinkClick = () => {
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center pt-6 items-start`}
      style={{
        backgroundColor: isClosing ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.5)",
        opacity: isClosing ? 0 : 1,
        transition: "background-color 0.3s, opacity 0.3s",
      }}
      onClick={handleClose}
    >
      <motion.div
        className="w-[740px] bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={{
          transform: isClosing ? "scale(0.95)" : "scale(1)",
          opacity: isClosing ? 0 : 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[46px] px-4 flex items-center relative border-b border-gray-200">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            placeholder={placeholder}
            className="w-full h-full pl-10 pr-4 text-base border-none focus:outline-none placeholder-gray-400"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="h-[43px] px-4 flex items-end border-b border-gray-200 space-x-4 text-base font-medium text-gray-600">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`search-tab relative pb-2 ${
                activeTab === tab ? "text-orange-500" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span
                className={`tab-underline absolute inset-x-0 bottom-0 h-[3px] bg-orange-500 origin-left ${
                  activeTab === tab ? "scale-x-100" : "scale-x-0"
                } transition-transform duration-200`}
              />
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {activeTab === "Тайтли" ? (
            isLoading ? (
              <div className="text-center text-gray-500">Завантаження...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto space-y-3">
                {searchResults.map((novel) => (
                  <Link
                    key={novel.id}
                    to={`/novel/${novel.id}/${novel.slug}`}
                    className="flex p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-200"
                    onClick={handleClose}
                  >
                    <img
                      src={novel.coverUrl}
                      alt={novel.titleUk}
                      className="w-16 h-24 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-0.5">
                        {novel.status || "Завершено"}
                      </div>
                      <div className="text-gray-900 font-medium leading-snug">
                        {novel.titleUk} {novel.type && `(${novel.type})`}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Корея{" "}
                        {novel.createdAt
                          ? new Date(novel.createdAt).getFullYear() + " г."
                          : "Невідомий рік"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery.trim().length > 0 ? (
              <div className="text-center text-gray-500">
                Нічого не знайдено
              </div>
            ) : (
              <div className="text-center text-gray-500">
                {extendedText}{" "}
                <Link
                  to={link}
                  className="text-orange-500 hover:underline"
                  onClick={handleLinkClick}
                >
                  {activeTab === "Тайтли" ? "каталозі" : "на цій сторінці"}
                </Link>
              </div>
            )
          ) : (
            <div className="text-center text-gray-500">
              {extendedText}{" "}
              <Link
                to={link}
                className="text-orange-500 hover:underline"
                onClick={handleLinkClick}
              >
                {activeTab === "Тайтли" ? "каталозі" : "на цій сторінці"}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Search;