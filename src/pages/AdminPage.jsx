import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import UserManagement from '../components/adminPage/UserManagement';
import NovelManagement from '../components/adminPage/NovelManagement';
import TagManagement from '../components/adminPage/TagManagement';
import GenreManagement from '../components/adminPage/GenreManagement';
import ReviewManagement from '../components/adminPage/ReviewManagement';
import { Helmet } from 'react-helmet';
import { useNotification } from '../components/NotificationProvider';

const Dashboard = ({ user }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-[#212529] mb-4">Ласкаво просимо, {user?.username || 'Адмін'}!</h2>
    <p className="text-gray-600">Це ваша адмін-панель. Виберіть опцію з меню зліва, щоб керувати користувачами, новелами або відгуками.</p>
  </div>
);

const AdminPanel = () => {
  const { notify } = useNotification();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const sidebarRef = useRef(null);

  const isAdmin = user?.roles?.some(role => role.name === 'ROLE_ADMIN');

    useEffect(() => {
    if (!isAdmin) {
      notify('error', 'Доступ заборонено: у вас немає прав адміністратора.');
    }
  }, [isAdmin, notify]);


  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const menuItems = [
    { id: 'dashboard', label: 'Панель', icon: 'dashboard' },
    { id: 'users', label: 'Користувачі', icon: 'group' },
    { id: 'novels', label: 'Новели', icon: 'auto_stories' },
    { id: 'genres', label: 'Жанри', icon: 'category' },
    { id: 'tags', label: 'Теги', icon: 'tag' },
    { id: 'reviews', label: 'Відгуки', icon: 'rate_review' },
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case 'users': return <UserManagement />;
      case 'novels': return <NovelManagement />;
      case 'reviews': return <ReviewManagement />;
      case 'tags': return <TagManagement />;
      case 'genres': return <GenreManagement />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Helmet>
        <title>Адмін панель - {menuItems.find(m => m.id === activeComponent)?.label || 'Панель'}</title>
        <meta name="description" content="Адмінська панель для керування контентом сайту." />
      </Helmet>

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className={`text-lg font-bold text-[#212529] transition-all duration-200 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            Адмін меню
          </h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <span className="material-icons">{isSidebarOpen ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveComponent(item.id)}
              title={item.label}
              className={`w-full flex items-center px-3 py-2 mb-2 rounded-md text-[#212529] transition ${
                activeComponent === item.id
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="material-icons mr-2">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="min-h-screen p-6 pt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;