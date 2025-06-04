import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTags } from '../api/tagApi.js';
import { getAllGenres } from '../api/genreApi.js';
import { createNovel, getNovelById, updateNovelById } from '../api/novelApi.js';
import { useNotification } from '../components/NotificationProvider';

const CreateTitlePage = () => {
  const { id } = useParams();
  const [isEditing] = useState(!!id);
  const [titleUk, setTitleUk] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [altTitles, setAltTitles] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('');
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [genreSearch, setGenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const genreDropdownRef = useRef(null);
  const tagDropdownRef = useRef(null);

  const inputClass = "mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none";
  const errorInputClass = "mt-1 block w-full border border-red-500 rounded-md p-2 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:outline-none";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [genresData, tagsData] = await Promise.all([getAllGenres(), getAllTags()]);
        setGenres(genresData);
        setTags(tagsData);

        if (id) {
          const novel = await getNovelById(id);
          setTitleUk(novel.titleUk || '');
          setTitleEn(novel.titleEn || '');
          setAltTitles(novel.altTitles || []);
          setCoverPreview(novel.coverUrl || '');
          setBackgroundPreview(novel.bannerUrl || '');
          setType(novel.type || '');
          setStatus(novel.status || '');
          setAgeRestriction(novel.ageRating || '');
          setSelectedGenres(novel.genres?.map((g) => g.id) || []);
          setSelectedTags(novel.tags?.map((t) => t.id) || []);
          setDescription(novel.description || '');
          setSourceLink(novel.originalUrl || '');
          setReleaseYear(novel.releaseYear?.toString() || '');
          
          if (user?.id != null && novel?.author?.id != null) {
            const userId = String(user.id);
            const ownerId = String(novel.userId ?? novel.author.id);
            const isAdmin = user.roles?.some(role => role.name === 'ROLE_ADMIN');
            setIsOwner(userId === ownerId || isAdmin);
          } else {
            setIsOwner(false);
          }
        }
      } catch {
        setError('Не вдалося завантажити дані');
      }
    };
    loadData();
  }, [id, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const typeMapping = {
    'Японія': 'JAPAN',
    'Корея': 'KOREA',
    'Китай': 'CHINA',
    'Англійська': 'ENGLISH',
    'Оригінал': 'ORIGINAL',
    'Фанфік': 'FANFIC'
  };

  const statusMapping = {
    'Онґоінг': 'ONGOING',
    'Завершено': 'COMPLETED',
    'Анонсовано': 'ANNOUNCED',
    'Призупинено': 'PAUSED',
    'Відмінено': 'DISCONTINUED'
  };

  const ageRatingMapping = {
    'Немає': 'NONE',
    '6+': 'SIX_PLUS',
    '12+': 'TWELVE_PLUS',
    '16+': 'SIXTEEN_PLUS',
    '18+': 'EIGHTEEN_PLUS'
  };

  const validateForm = () => {
    const errors = {};

    if (!titleUk.trim()) {
      errors.titleUk = 'Назва українською обов’язкова';
    } else if (titleUk.length > 255) {
      errors.titleUk = 'Назва українською не може бути довшою за 255 символів';
    }

    if (!titleEn.trim()) {
      errors.titleEn = 'Назва англійською обов’язкова';
    } else if (titleEn.length > 255) {
      errors.titleEn = 'Назва англійською не може бути довшою за 255 символів';
    }

    if (!description.trim()) {
      errors.description = 'Опис обов’язковий';
    }

    if (!type) {
      errors.type = 'Тип новели обов’язковий';
    }

    if (!status) {
      errors.status = 'Статус новели обов’язковий';
    }

    if (!ageRestriction) {
      errors.ageRestriction = 'Вікове обмеження обов’язкове';
    }

    if (selectedGenres.length === 0) {
      errors.genres = 'Потрібно вибрати принаймні один жанр';
    }

    if (releaseYear && (isNaN(releaseYear) || releaseYear < 1900 || releaseYear > new Date().getFullYear())) {
      errors.releaseYear = `Рік випуску має бути між 1900 та ${new Date().getFullYear()}`;
    }

    altTitles.forEach((title, index) => {
      if (title.trim()) {
        if (title.length > 255) {
          errors[`altTitle${index}`] = 'Альтернативна назва не може бути довшою за 255 символів';
        } else if (title.toLowerCase() === titleUk.toLowerCase() || title.toLowerCase() === titleEn.toLowerCase()) {
          errors[`altTitle${index}`] = 'Альтернативна назва не може збігатися з основними назвами';
        } else if (
          altTitles.some((otherTitle, otherIndex) => 
            otherIndex !== index && 
            otherTitle.trim() && 
            otherTitle.toLowerCase() === title.toLowerCase()
          )
        ) {
          errors[`altTitle${index}`] = 'Альтернативні назви не можуть повторюватися';
        }
      }
    });

    if (sourceLink && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(sourceLink)) {
      errors.sourceLink = 'Введіть дійсне URL-посилання';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setError('Потрібно увійти в систему');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();

    if (backgroundImage) {
      formData.append('bannerFile', backgroundImage);
    }

    if (coverImage) {
      formData.append('coverFile', coverImage);
    }

    formData.append('titleUk', titleUk);
    formData.append('titleEn', titleEn);
    altTitles.forEach((title) => {
      if (title.trim()) {
        formData.append('altTitles', title);
      }
    });
    formData.append('type', typeMapping[type] || '');
    formData.append('status', statusMapping[status] || '');
    formData.append('releaseYear', releaseYear || 0);
    formData.append('ageRating', ageRatingMapping[ageRestriction] || '');

    const selectedGenresData = genres
      .filter(genre => selectedGenres.includes(genre.id))
      .map(genre => ({ id: genre.id, name: genre.name }));

    selectedGenresData.forEach((genre, index) => {
      formData.append(`genres[${index}].id`, genre.id.toString());
      formData.append(`genres[${index}].name`, genre.name);
    });

    const selectedTagsData = tags
      .filter(tag => selectedTags.includes(tag.id))
      .map(tag => ({ id: tag.id, name: tag.name }));

    selectedTagsData.forEach((tag, index) => {
      formData.append(`tags[${index}].id`, tag.id.toString());
      formData.append(`tags[${index}].name`, tag.name);
    });

    formData.append('description', description);
    formData.append('authorId', user.id.toString());
    formData.append('originalUrl', sourceLink);

    try {
      if (isEditing) {
        await updateNovelById(id, formData);
        notify('success', 'Новелу успішно оновлено!');
        navigate('/');
      } else {
        await createNovel(formData);
        notify('success', 'Новелу успішно створено!');
        navigate('/');
      }
    } catch (error) {
      console.error(`Помилка при ${isEditing ? 'оновленні' : 'створенні'} новели:`, error);
      setError(`Не вдалося ${isEditing ? 'оновити' : 'створити'} новелу. Спробуйте ще раз.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddAltTitle = () => {
    setAltTitles([...altTitles, '']);
  };

  const handleAltTitleChange = (index, value) => {
    const updatedTitles = [...altTitles];
    updatedTitles[index] = value;
    setAltTitles(updatedTitles);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (value.trim()) {
        if (value.length > 255) {
          newErrors[`altTitle${index}`] = 'Альтернативна назва не може бути довшою за 255 символів';
        } else if (value.toLowerCase() === titleUk.toLowerCase() || value.toLowerCase() === titleEn.toLowerCase()) {
          newErrors[`altTitle${index}`] = 'Альтернативна назва не може збігатися з основними назвами';
        } else if (
          altTitles.some((otherTitle, otherIndex) => 
            otherIndex !== index && 
            otherTitle.trim() && 
            otherTitle.toLowerCase() === value.toLowerCase()
          )
        ) {
          newErrors[`altTitle${index}`] = 'Альтернативні назви не можуть повторюватися';
        } else {
          delete newErrors[`altTitle${index}`];
        }
      } else {
        delete newErrors[`altTitle${index}`];
      }
      return newErrors;
    });
  };

  const handleRemoveAltTitle = (index) => {
    const updatedTitles = altTitles.filter((_, i) => i !== index);
    setAltTitles(updatedTitles);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`altTitle${index}`];

      updatedTitles.forEach((title, i) => {
        if (title.trim()) {
          if (title.length > 255) {
            newErrors[`altTitle${i}`] = 'Альтернативна назва не може бути довшою за 255 символів';
          } else if (title.toLowerCase() === titleUk.toLowerCase() || title.toLowerCase() === titleEn.toLowerCase()) {
            newErrors[`altTitle${i}`] = 'Альтернативна назва не може збігатися з основними назвами';
          } else if (
            updatedTitles.some((otherTitle, otherIndex) => 
              otherIndex !== i && 
              otherTitle.trim() && 
              otherTitle.toLowerCase() === title.toLowerCase()
            )
          ) {
            newErrors[`altTitle${i}`] = 'Альтернативні назви не можуть повторюватися';
          } else {
            delete newErrors[`altTitle${i}`];
          }
        } else {
          delete newErrors[`altTitle${i}`];
        }
      });
      return newErrors;
    });
  };

  const handleAddGenre = (genre) => {
    setSelectedGenres([...selectedGenres, genre.id]);
    setValidationErrors(prev => ({ ...prev, genres: null }));
  };

  const handleRemoveGenre = (genreId) => {
    const updatedGenres = selectedGenres.filter((id) => id !== genreId);
    setSelectedGenres(updatedGenres);
    if (updatedGenres.length === 0) {
      setValidationErrors(prev => ({ ...prev, genres: 'Потрібно вибрати принаймні один жанр' }));
    }
  };

  const handleAddTag = (tag) => {
    setSelectedTags([...selectedTags, tag.id]);
  };

  const handleRemoveTag = (tagId) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId));
  };

  const filteredGenres = genres
    .filter((genre) => !selectedGenres.includes(genre.id))
    .filter((genre) =>
      genre.name.toLowerCase().includes(genreSearch.toLowerCase())
    );

  const filteredTags = tags
    .filter((tag) => !selectedTags.includes(tag.id))
    .filter((tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="font-bold mb-6 text-gray-800 text-center text-xl">
        {isEditing ? 'Редагування тайтлу' : 'Створення тайтлу'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Обкладинка */}
        <div className="flex space-x-4">
          <div className="border-dashed border-2 border-gray-300 rounded-lg text-center" style={{ width: '136px', height: '191px' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Обкладинка</label>
            <div className="relative w-full h-full flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleImageUpload(e, setCoverImage, setCoverPreview)}
                disabled={isSubmitting}
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs text-gray-500">Натисніть або перетягніть</p>
              </div>
            </div>
          </div>

          {(coverImage || coverPreview) && (
            <div className="flex items-center justify-center">
              <img
                src={coverImage ? URL.createObjectURL(coverImage) : coverPreview}
                alt="Cover Preview"
                className="rounded-lg"
                style={{ width: '136px', height: '191px' }}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <div className="border-dashed border-2 border-gray-300 rounded-lg text-center" style={{ width: '136px', height: '191px' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Фон</label>
            <div className="relative w-full h-full flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleImageUpload(e, setBackgroundImage, setBackgroundPreview)}
                disabled={isSubmitting}
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs text-gray-500">Натисніть або перетягніть</p>
              </div>
            </div>
          </div>

          {(backgroundImage || backgroundPreview) && (
            <div className="flex-1">
              <img
                src={backgroundImage ? URL.createObjectURL(backgroundImage) : backgroundPreview}
                alt="Background Preview"
                className="max-w-full h-auto rounded-lg"
                style={{ width: 'full', height: '191px', marginRight: '8px' }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Назва українською</label>
          <input
            type="text"
            value={titleUk}
            onChange={(e) => {
              setTitleUk(e.target.value);
              setValidationErrors(prev => ({
                ...prev,
                titleUk: !e.target.value.trim() ? 'Назва українською обов’язкова' :
                e.target.value.length > 255 ? 'Назва українською не може бути довшою за 255 символів' : null
              }));
              altTitles.forEach((title, index) => {
                if (title.trim()) {
                  setValidationErrors(prev => ({
                    ...prev,
                    [`altTitle${index}`]: title.toLowerCase() === e.target.value.toLowerCase()
                      ? 'Альтернативна назва не може збігатися з основними назвами'
                      : prev[`altTitle${index}`]
                  }));
                }
              });
            }}
            className={validationErrors.titleUk ? errorInputClass : inputClass}
            placeholder="Введіть назву"
            required
            disabled={isSubmitting}
          />
          {validationErrors.titleUk && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.titleUk}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Назва англійською</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => {
              setTitleEn(e.target.value);
              setValidationErrors(prev => ({
                ...prev,
                titleEn: !e.target.value.trim() ? 'Назва англійською обов’язкова' :
                e.target.value.length > 255 ? 'Назва англійською не може бути довшою за 255 символів' : null
              }));
              altTitles.forEach((title, index) => {
                if (title.trim()) {
                  setValidationErrors(prev => ({
                    ...prev,
                    [`altTitle${index}`]: title.toLowerCase() === e.target.value.toLowerCase()
                      ? 'Альтернативна назва не може збігатися з основними назвами'
                      : prev[`altTitle${index}`]
                  }));
                }
              });
            }}
            className={validationErrors.titleEn ? errorInputClass : inputClass}
            placeholder="Введіть назву"
            required
            disabled={isSubmitting}
          />
          {validationErrors.titleEn && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.titleEn}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Альтернативні назви</label>
          <div className="space-y-2">
            {altTitles.map((title, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleAltTitleChange(index, e.target.value)}
                  className={validationErrors[`altTitle${index}`] ? errorInputClass : inputClass}
                  placeholder={`Назва ${index + 1}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAltTitle(index)}
                  className="text-red-600 hover:text-red-800"
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </div>
            ))}
            {altTitles.map((_, index) => (
              validationErrors[`altTitle${index}`] && (
                <p key={`error-${index}`} className="text-red-500 text-xs mt-1">{validationErrors[`altTitle${index}`]}</p>
              )
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddAltTitle}
            className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Додати назву
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setValidationErrors(prev => ({ ...prev, type: !e.target.value ? 'Тип новели обов’язковий' : null }));
            }}
            className={validationErrors.type ? errorInputClass : inputClass}
            required
            disabled={isSubmitting}
          >
            <option value="">Оберіть тип</option>
            <option value="Японія">Японія</option>
            <option value="Корея">Корея</option>
            <option value="Китай">Китай</option>
            <option value="Англійська">Англійська</option>
            <option value="Фанфік">Фанфік</option>
            <option value="Оригінал">Оригінал</option>
          </select>
          {validationErrors.type && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setValidationErrors(prev => ({ ...prev, status: !e.target.value ? 'Статус новели обов’язковий' : null }));
            }}
            className={validationErrors.status ? errorInputClass : inputClass}
            required
            disabled={isSubmitting}
          >
            <option value="">Оберіть статус</option>
            <option value="Онґоінг">Онґоінг</option>
            <option value="Завершено">Завершено</option>
            <option value="Анонсовано">Анонсовано</option>
            <option value="Призупинено">Призупинено</option>
            <option value="Відмінено">Відмінено</option>
          </select>
          {validationErrors.status && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Рік випуску</label>
          <input
            type="number"
            value={releaseYear}
            onChange={(e) => {
              setReleaseYear(e.target.value);
              setValidationErrors(prev => ({
                ...prev,
                releaseYear: e.target.value && (isNaN(e.target.value) || e.target.value < 1900 || e.target.value > new Date().getFullYear())
                  ? `Рік випуску має бути між 1900 та ${new Date().getFullYear()}`
                  : null
              }));
            }}
            className={validationErrors.releaseYear ? errorInputClass : inputClass}
            placeholder="Введіть рік"
            min="1900"
            max={new Date().getFullYear()}
            disabled={isSubmitting}
          />
          {validationErrors.releaseYear && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.releaseYear}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Вікове обмеження</label>
          <select
            value={ageRestriction}
            onChange={(e) => {
              setAgeRestriction(e.target.value);
              setValidationErrors(prev => ({ ...prev, ageRestriction: !e.target.value ? 'Вікове обмеження обов’язкове' : null }));
            }}
            className={validationErrors.ageRestriction ? errorInputClass : inputClass}
            required
            disabled={isSubmitting}
          >
            <option value="">Оберіть обмеження</option>
            <option value="Немає">Немає</option>
            <option value="6+">6+</option>
            <option value="12+">12+</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
          </select>
          {validationErrors.ageRestriction && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.ageRestriction}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Жанри</label>
          <div className={validationErrors.genres ? "border border-red-500 rounded-md p-3" : "border border-gray-300 rounded-md p-3"}>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
              <button
                type="button"
                onClick={() => setShowGenreDropdown(true)}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Додати
              </button>

              {[...selectedGenres]
                .map((genreId) => genres.find((g) => g.id === genreId))
                .filter(Boolean)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((genre) => (
                  <span
                    key={genre.id}
                    className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                  >
                    {genre.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(genre.id)}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </span>
              ))}
            </div>
            {validationErrors.genres && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.genres}</p>
            )}

            {showGenreDropdown && (
              <div
                ref={genreDropdownRef}
                className="absolute mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-10"
              >
                <div className="relative p-3">
                  <svg
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Пошук жанру..."
                    disabled={isSubmitting}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto px-3 pb-3">
                  {[...filteredGenres]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((genre) => (
                      <div
                        key={genre.id}
                        onClick={() => handleAddGenre(genre)}
                        className="px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      >
                        {genre.name}
                      </div>
                  ))}
                  {filteredGenres.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">Немає доступних жанрів</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Теги</label>
          <div className="border border-gray-300 rounded-md p-3">
            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
              <button
                type="button"
                onClick={() => setShowTagDropdown(true)}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Додати
              </button>

              {[...selectedTags]
                .map((tagId) => tags.find((t) => t.id === tagId))
                .filter(Boolean)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </span>
              ))}
            </div>

            {showTagDropdown && (
              <div ref={tagDropdownRef} className="absolute mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-10">
                <div className="relative p-3">
                  <svg
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Пошук тегу..."
                    disabled={isSubmitting}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto px-3 pb-3">
                  {[...filteredTags]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((tag) => (
                      <div
                        key={tag.id}
                        onClick={() => handleAddTag(tag)}
                        className="px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      >
                        {tag.name}
                      </div>
                  ))}
                  {filteredTags.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">Немає доступних тегів</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Посилання на оригінал</label>
          <input
            type="text"
            value={sourceLink}
            onChange={(e) => {
              setSourceLink(e.target.value);
              setValidationErrors(prev => ({
                ...prev,
                sourceLink: e.target.value && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(e.target.value)
                  ? 'Введіть дійсне URL-посилання'
                  : null
              }));
            }}
            className={validationErrors.sourceLink ? errorInputClass : inputClass}
            placeholder="Вкажіть посилання на оригінальну роботу (необов’язково)"
            disabled={isSubmitting}
          />
          {validationErrors.sourceLink && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.sourceLink}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Опис</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setValidationErrors(prev => ({
                ...prev,
                description: !e.target.value.trim() ? 'Опис обов’язковий' : null
              }));
            }}
            className={validationErrors.description ? `${errorInputClass} h-32 resize-none` : `${inputClass} h-32 resize-none`}
            placeholder="Короткий опис тайтлу..."
            required
            disabled={isSubmitting}
          />
          {validationErrors.description && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className={`py-2 px-6 rounded-md w-1/2 transition-colors flex items-center justify-center
              ${isSubmitting || Object.keys(validationErrors).some(k => validationErrors[k]) || (isEditing && !isOwner)
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            disabled={isSubmitting || Object.keys(validationErrors).some(k => validationErrors[k]) || (isEditing && !isOwner)}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Обробка...
              </>
            ) : (
              isEditing ? 'Оновити' : 'Створити'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTitlePage;