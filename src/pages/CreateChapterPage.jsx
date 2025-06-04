import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createChapter, getChapterById, updateChapter } from "../api/chapterApi";
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationProvider';

export default function ChapterCreatePage() {
  const { novelName, id, novelSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  const { notify } = useNotification();

  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [chapter, setChapter] = useState("");
  const [ownerId, setOwnerId] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const contentRef = useRef(null);

  const isEditMode = Boolean(chapterId);

  const inputClass = "border rounded px-2 py-1 text-sm border-gray-300 w-full sm:w-auto";
  const errorInputClass = "border rounded px-2 py-1 text-sm border-red-500 focus:border-red-500 focus:ring focus:ring-red-200 focus:outline-none w-full sm:w-auto";

  const updateCounts = () => {
    const content = contentRef.current?.innerText || "";
    const chars = content.length;
    const lines = content.split("\n").length;
    setCharCount(chars);
    setLineCount(lines);
    setValidationErrors(prev => ({
      ...prev,
      content: chars < 1000 ? 'Вміст глави має містити принаймні 1000 символів' : null
    }));
  };

  useEffect(() => {
    if (isEditMode) {
      getChapterById(chapterId)
        .then(data => {
          setTitle(data.title || "");
          setVolume(data.volumeNumber?.toString() || "");
          setChapter(data.chapterNumber?.toString() || "");
          setOwnerId(data.userId || null);
          if (contentRef.current) {
            contentRef.current.innerHTML = data.content || "";
            updateCounts();
          }
        })
        .catch(err => {
          console.error("Error loading chapter:", err);
          notify('error', 'Не вдалося завантажити главу.');
        });
    }
  }, [chapterId, isEditMode, notify]);

  useEffect(() => {
    const handleInput = () => updateCounts();
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("input", handleInput);
      return () => contentElement.removeEventListener("input", handleInput);
    }
  }, []);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
    updateCounts();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const success = document.execCommand("insertText", false, "    ");
      if (!success) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode("    ");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateCounts();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Назва глави обов’язкова';
    } else if (title.length > 255) {
      errors.title = 'Назва глави не може бути довшою за 255 символів';
    }

    if (charCount < 1000) {
      errors.content = 'Вміст глави має містити принаймні 1000 символів';
    }

    if (volume && (!/^\d+$/.test(volume) || parseInt(volume, 10) <= 0)) {
      errors.volume = 'Номер тому має бути додатним цілим числом';
    }

    if (chapter && (!/^\d+$/.test(chapter) || parseInt(chapter, 10) <= 0)) {
      errors.chapter = 'Номер глави має бути додатним цілим числом';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (authLoading || isSubmitting) return;

    if (isEditMode && ownerId && authUser?.id !== ownerId) {
      notify('error', 'Ви не маєте права редагувати цю главу.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      content: contentRef.current?.innerHTML || "",
      novelId: Number(id),
      volumeNumber: volume ? parseInt(volume, 10) : null,
      chapterNumber: chapter ? parseInt(chapter, 10) : null,
      likeCount: 0,
    };

    try {
      if (isEditMode) {
        await updateChapter(chapterId, payload);
        notify('success', 'Главу успішно оновлено!');
      } else {
        await createChapter(payload);
        notify('success', 'Главу успішно створено!');
      }
      navigate(`/novel/${id}/${novelSlug}#chapters`);
    } catch (error) {
      console.error("Error saving chapter:", error);
      notify('error', `Не вдалося ${isEditMode ? 'оновити' : 'створити'} главу. Спробуйте ще раз.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const btnClass =
    "flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 transition-colors text-gray-600";

  const isOwner =
    !isEditMode ||
    ownerId === authUser?.id ||
    authUser?.roles?.some(role => role.name === 'ROLE_ADMIN');

  return (
    <div className="min-h-screen bg-white flex flex-col mx-4 sm:mx-[13%] py-4 border border-gray-200 rounded-lg shadow-lg">
      <div className="px-4 sm:px-20 text-sm text-gray-600 pb-2">
        <Link
          to={`/novel/${id}/${novelSlug}`}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          {novelName}
        </Link>{" "}
        / <span className="font-semibold">{isEditMode ? "Редагування глави" : "Створення глави"}</span>
      </div>

      <div className="border-b border-gray-200" />

      <div className="sticky top-[65px] z-20 bg-white border-b border-gray-200 px-4 sm:px-20 py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-20">
              <input
                type="text"
                pattern="[0-9]*"
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  setValidationErrors(prev => ({
                    ...prev,
                    volume: e.target.value && (!/^\d+$/.test(e.target.value) || parseInt(e.target.value, 10) <= 0)
                      ? 'Номер тому має бути додатним цілим числом'
                      : null
                  }));
                }}
                className={`${isOwner ? (validationErrors.volume ? errorInputClass : inputClass) : "bg-gray-100 cursor-not-allowed border-gray-300 w-full sm:w-20"}`}
                placeholder="Том"
                readOnly={!isOwner}
                disabled={isSubmitting}
              />
              {validationErrors.volume && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.volume}</p>
              )}
            </div>
            <div className="w-full sm:w-20">
              <input
                type="text"
                value={chapter}
                onChange={(e) => {
                  setChapter(e.target.value);
                  setValidationErrors(prev => ({
                    ...prev,
                    chapter: e.target.value && (!/^\d+$/.test(e.target.value) || parseInt(e.target.value, 10) <= 0)
                      ? 'Номер глави має бути додатним цілим числом'
                      : null
                  }));
                }}
                className={`${isOwner ? (validationErrors.chapter ? errorInputClass : inputClass) : "bg-gray-100 cursor-not-allowed border-gray-300 w-full sm:w-20"}`}
                placeholder="Глава"
                readOnly={!isOwner}
                disabled={isSubmitting}
              />
              {validationErrors.chapter && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.chapter}</p>
              )}
            </div>
            <div className="w-full sm:flex-1 sm:max-w-[400px]">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setValidationErrors(prev => ({
                    ...prev,
                    title: !e.target.value.trim() ? 'Назва глави обов’язкова' :
                           e.target.value.length > 255 ? 'Назва глави не може бути довшою за 255 символів' : null
                  }));
                }}
                className={`${isOwner ? (validationErrors.title ? errorInputClass : inputClass) : "bg-gray-100 cursor-not-allowed border-gray-300 w-full sm:flex-1 sm:max-w-[400px]"}`}
                placeholder="Назва глави"
                readOnly={!isOwner}
                disabled={isSubmitting}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded text-sm text-white flex items-center justify-center w-full sm:w-auto
                ${isSubmitting || Object.keys(validationErrors).some(k => validationErrors[k]) || !isOwner
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"}`}
              disabled={isSubmitting || Object.keys(validationErrors).some(k => validationErrors[k]) || !isOwner || authLoading}
              title={isEditMode && ownerId !== authUser?.id ? "Ви не маєте права редагувати цю главу" : ""}
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
                isEditMode ? "Зберегти" : "Створити"
              )}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {charCount}/{lineCount}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
          <button className={btnClass} onClick={() => execCmd("bold")} title="Жирний — Ctrl+B" disabled={!isOwner || isSubmitting}>
            <b>B</b>
          </button>
          <button className={btnClass} onClick={() => execCmd("italic")} title="Курсив — Ctrl+I" disabled={!isOwner || isSubmitting}>
            <i>I</i>
          </button>
          <button className={btnClass} onClick={() => execCmd("underline")} title="Підкреслення — Ctrl+U" disabled={!isOwner || isSubmitting}>
            <u>U</u>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-20 py-3">
        <div
          ref={contentRef}
          contentEditable={isOwner}
          placeholder="Содержание главы..."
          onKeyDown={handleKeyDown}
          className={`min-h-[300px] px-4 py-3 focus:outline-none text-gray-800 prose w-full ${validationErrors.content ? "border border-red-500 rounded" : ""}`}
          style={{
            whiteSpace: "pre-wrap",
            outline: "none",
            cursor: isOwner ? "text" : "not-allowed",
          }}
          suppressContentEditableWarning={true}
        />
        {validationErrors.content && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.content}</p>
        )}
      </div>
    </div>
  );
}