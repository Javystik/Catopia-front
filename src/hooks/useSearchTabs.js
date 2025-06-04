import { useState } from "react";

export const useSearchTabs = () => {
  const tabsData = {
    Тайтли: { 
      placeholder: "Пошук тайтлів", 
      link: "/catalog" 
    },
    Команда: { 
      placeholder: "Пошук команд", 
      link: "/teams" 
    },
    Персонаж: { 
      placeholder: "Пошук персонажів", 
      link: "/characters" 
    },
    Людина: { 
      placeholder: "Пошук людей", 
      link: "/people" 
    },
    Франшиза: { 
      placeholder: "Пошук франшиз", 
      link: "/franchises" 
    },
    Видавець: { 
      placeholder: "Пошук видавців", 
      link: "/publishers" 
    },
    Користувач: { 
      placeholder: "Пошук користувачів", 
      link: "/users" 
    },
  };

  const tabNames = Object.keys(tabsData);
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  const placeholder = tabsData[activeTab].placeholder;
  const link = tabsData[activeTab].link;

  let extendedText = '';
  
  if (activeTab === "Тайтли") {
    extendedText = `Розширений пошук тайтлів знаходиться в `;
  } else {
    extendedText = `Список всіх ${activeTab.toLowerCase()} можна знайти `;
  }

  return {
    tabs: tabNames,
    activeTab,
    setActiveTab,
    placeholder,
    extendedText,
    link,
  };
};