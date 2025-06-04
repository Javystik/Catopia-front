import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import Header from './components/Header';
import NotFound from './pages/NotFoundPage';
import MainPage from './pages/MainPage';
import CatalogPage from './pages/CatalogPage';
import NovelPage from './pages/NovelPage';
import ChapterPage from './pages/ChapterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CreateTitlePage from './pages/CreateTitlePage';
import CreateChapterPage from './pages/CreateChapterPage';
import EditReviewPage from './pages/EditReviewPage';
import ReviewPage from './pages/ReviewPage';
import AdminPage from './pages/AdminPage';
import { NotificationProvider } from './components/NotificationProvider';

const isAndroid = /Android/i.test(navigator.userAgent);

const PrivateRoute = ({ element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Завантаження...</div>;

  return user ? element : <Navigate to="/login" state={{ from: location }} />;
};

const App = () => {
  const { pathname } = useLocation();

  const isChapterPage = pathname.startsWith('/chapter/');
  const isLoginPage = pathname === '/login';
  const isCreateChapter = pathname.startsWith('/createChapter');
  const isAdminPage = pathname === '/admin';

  const showHeader = !isLoginPage && !isChapterPage && !isAdminPage;

  const showFooter =
    !isChapterPage && !isLoginPage && !isCreateChapter && !isAdminPage && !isAndroid;

  return (
    <AuthProvider>
      <NotificationProvider>
        {showHeader && <Header />}
        <div className={`min-h-screen ${!isChapterPage ? 'pt-[65px]' : ''}`}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/novel/:novelId/:novelSlug" element={<NovelPage />} />
            <Route
              path="/chapter/:novelId/:novelSlug/v/:volume/c/:chapter"
              element={<ChapterPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/callback" element={<LoginPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/createTitle/:id?" element={<CreateTitlePage />} />
            <Route
              path="/createChapter/:id/:novelSlug/:novelName/:chapterId?"
              element={<CreateChapterPage />}
            />
            <Route
              path="/editReview/:id/:novelSlug/:novelName/:reviewId?"
              element={<EditReviewPage />}
            />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/admin" element={<PrivateRoute element={<AdminPage />} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {showFooter && <Footer />}
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;