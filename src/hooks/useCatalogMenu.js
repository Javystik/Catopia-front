import { useState } from "react";

export const useCatalogMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const menuData = {
    leftColumn: [
      { icon: "collections_bookmark", label: "Тайтли", link: "/catalog" },
      { icon: "whatshot", label: "Зараз читають", link: "#" },
      { icon: "collections", label: "Колекції", link: "#" },
      { icon: "rate_review", label: "Відгуки та Рецензії", link: "#" },
      { icon: "groups", label: "Команди", link: "#" },
      { icon: "person", label: "Люди", link: "#" },
      { icon: "emoji_people", label: "Персонажі", link: "#" },
      { icon: "auto_awesome", label: "Франшизи", link: "#" },
      { icon: "business", label: "Видавництва", link: "#" },
      { icon: "people", label: "Користувачі", link: "#" },
    ],
    rightColumn: [
      { label: "Японія", link: "#" },
      { label: "Корея", link: "#" },
      { label: "Китай", link: "#" },
      { label: "Англійський", link: "#" },
      { label: "Авторський", link: "#" },
      { label: "Фанфік", link: "#" },
    ],
  };

  return { isOpen, toggleMenu, closeMenu, menuData };
};