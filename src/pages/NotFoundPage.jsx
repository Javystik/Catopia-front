import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen px-4">
      <Helmet>
        <title>Сторінка не знайдена 404</title>
      </Helmet>

      <div className="flex items-center space-x-12">
        <img
          src="/gifs/panic-anime.gif"
          alt="Паніка"
          className="h-48 w-auto object-contain"
        />

        <div className="flex items-start space-x-8">
          <h1 className="text-[150px] font-extrabold text-orange-500 leading-none">
            404
          </h1>

          <div className="text-black max-w-xl">
            <h2 className="text-4xl font-bold mb-4">Сторінка не знайдена</h2>
            <p className="text-2xl leading-relaxed">
              Сторінка, до якої ви звернулись, була видалена або переміщена.
              Перейдіть, будь ласка, на{" "}
              <Link
                to="/"
                className="text-orange-500 hover:underline font-semibold"
              >
                головну сторінку
              </Link>{" "}
              сайту.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;