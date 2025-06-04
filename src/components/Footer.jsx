import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1c1c1c] py-8">
      <div className="max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-sm" style={{ color: '#BFBFBF' }}>
          © 2025 Catopia. Всі права захищені.
        </div>

        <div className="flex space-x-6 text-sm">
          <Link to="/" className="hover:text-white" style={{ color: '#BFBFBF' }}>
            Про нас
          </Link>
          <Link to="/" className="hover:text-white" style={{ color: '#BFBFBF' }}>
            Контакти
          </Link>
          <Link to="/" className="hover:text-white" style={{ color: '#BFBFBF' }}>
            Правила користування
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;