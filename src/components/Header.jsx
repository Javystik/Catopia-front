import { useState, useEffect, useRef } from "react";
import { useCatalogMenu } from "../hooks/useCatalogMenu";
import { useSearchTabs } from "../hooks/useSearchTabs";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "/images/logo-catopia-full.png";
import avatar from "/images/user_avatar.png";
import Search from "./Search";

export default function Header() {
  const { isOpen, toggleMenu, closeMenu, menuData } = useCatalogMenu();
  const { user, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [isLogoutMenuOpen, setIsLogoutMenuOpen] = useState(false);
  const { tabs, activeTab, setActiveTab, placeholder, extendedText, link } = useSearchTabs();

  const catalogRef = useRef(null);
  const logoutRef = useRef(null);

  const isAdmin = user?.roles?.some(role => role.name === "ROLE_ADMIN");

  const handleSearchOpen = () => setShowSearch(true);
  const handleSearchClose = () => setShowSearch(false);
  const toggleLogoutMenu = () => setIsLogoutMenuOpen((prev) => !prev);
  const closeLogoutMenu = () => setIsLogoutMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catalogRef.current && !catalogRef.current.contains(e.target)) {
        closeMenu();
      }
      if (logoutRef.current && !logoutRef.current.contains(e.target)) {
        closeLogoutMenu();
      }
    };

    if (isOpen || isLogoutMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, isLogoutMenuOpen, closeMenu]);

  const handleLogout = async () => {
    await logout();
    closeLogoutMenu();
  };

  const ArrowIcon = () => (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FEEED6] flex items-center px-[10%] justify-between shadow-sm text-[18px] text-[#212529] h-14">
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src={logo}
            alt="Catopia Logo"
            className="h-auto w-20 md:w-32"
          />
        </Link>

        <div className="flex flex-1 justify-center space-x-2 max-w-[600px] font-medium">
          <div className="relative" ref={catalogRef}>
            <button
              onClick={toggleMenu}
              className="flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-[#ffe0b2] transition"
            >
              <span className="material-icons">menu_book</span>
              <span className="hidden md:inline">Каталог</span>
              <span className="material-icons">expand_more</span>
            </button>

            <div
              className={`absolute top-full left-0 mt-1 z-40
                bg-white rounded-md shadow-lg transition-all duration-200 ease-in-out flex text-[14px] text-[#212529] font-normal
                ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
                w-[200px] md:w-[400px]
              `}
            >
              <div className="w-[200px] border-r border-gray-200 flex flex-col py-2">
                {menuData.leftColumn.map((item, i) => (
                  <Link
                    key={i}
                    to={item.link}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 transition"
                    onClick={closeMenu}
                  >
                    <span className="material-icons text-sm mr-2">{item.icon}</span>
                    {item.label}
                    {item.label === "Тайтли" && (
                      <span className="material-icons text-sm ml-auto">chevron_right</span>
                    )}
                  </Link>
                ))}
              </div>
              <div className="w-[200px] flex-col py-2 hidden md:flex">
                {menuData.rightColumn.map((item, i) => (
                  <Link
                    key={i}
                    to={item.link}
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  className="mx-2 mt-auto my-2 bg-orange-400 text-white py-2 rounded text-center hover:bg-orange-500 transition"
                  onClick={() => alert("Випадковий тайтл")}
                >
                  🎲 Випадковий тайтл
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSearchOpen}
            className="hidden md:flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-[#ffe0b2] transition"
          >
            <span className="material-icons">search</span>
            <span>Пошук</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          {user ? (
            <>
              <Link to="/createTitle">
                <button className="p-2 rounded-md hover:bg-[#ffe0b2] transition">
                  <span className="material-icons">create</span>
                </button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <button className="p-2 rounded-md hover:bg-[#ffe0b2] transition">
                    <span className="material-icons">admin_panel_settings</span>
                  </button>
                </Link>
              )}
              <Link to={`/profile/${user.id}`}>
                <button className="w-10 h-10 p-0 rounded-md overflow-hidden hover:bg-[#ffe0b2] transition">
                  <img
                    src={user.avatarUrl || avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              </Link>
              <div className="relative" ref={logoutRef}>
                <button
                  onClick={toggleLogoutMenu}
                  className="p-2 rounded-md hover:bg-[#ffe0b2] transition"
                >
                  <span className="material-icons">menu</span>
                </button>
                <div
                  className={`absolute top-full right-0 mt-1 z-40 w-[200px] bg-white rounded-md shadow-lg
                    transition-all duration-200 ease-in-out text-[14px] text-[#212529] font-normal ${
                      isLogoutMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-100 transition"
                  >
                    Вийти
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-2 rounded-lg transition duration-300"
              style={{ width: "184px", height: "32px" }}
            >
              <ArrowIcon />
              <span className="hidden md:inline">Вхід | Реєстрація</span>
            </Link>
          )}
        </div>
      </header>

      <Search
        show={showSearch}
        onClose={handleSearchClose}
        placeholder={placeholder}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        extendedText={extendedText}
        link={link}
      />
    </>
  );
}