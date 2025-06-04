import React from 'react';
import { Helmet } from 'react-helmet';
import RecomendsNovels from '../components/mainPage/RecomendsNovels';
import TrendingSection from '../components/mainPage/TrendingSection';
import UpdatesAndReviews from '../components/mainPage/UpdatesAndReviews';

const MainPage = () => {
  return (
    <div>
      <Helmet>
        <title>Catopia — Онлайн новели, ранобе, вебновели</title>
      </Helmet>

      <RecomendsNovels />

      <TrendingSection />

      <UpdatesAndReviews />
    </div>
  );
};

export default MainPage;