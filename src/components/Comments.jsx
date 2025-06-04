import React, { useState, useEffect } from "react";
import { getCommentsByChapterId, getCommentsByNovelId, getCommentsByReviewId, createComment, updateComment, deleteComment } from '../api/commentApi';
import { useAuth } from '../context/AuthContext';

const Comments = ({ novelId, chapterId, reviewId, onCommentCountChange }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [novelId, chapterId, reviewId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      let fetchedComments = [];
      if (reviewId) {
        fetchedComments = await getCommentsByReviewId(reviewId);
      } else if (chapterId) {
        fetchedComments = await getCommentsByChapterId(chapterId);
      } else if (novelId) {
        fetchedComments = await getCommentsByNovelId(novelId);
      }

      const commentTree = buildCommentTree(fetchedComments);
      setComments(commentTree);
      const totalCount = fetchedComments.length;
      onCommentCountChange?.(totalCount);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildCommentTree = (comments) => {
    const commentMap = {};
    const tree = [];

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    comments.forEach((comment) => {
      if (comment.parentCommentId) {
        commentMap[comment.parentCommentId]?.replies.push(comment);
      } else {
        tree.push(comment);
      }
    });

    return tree;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authUser || !authUser.id) {
      console.warn("Cannot submit comment: user not authenticated or missing ID");
      return;
    }

    const commentDTO = {
      text: newComment,
      novelId: novelId || null,
      chapterId: chapterId || null,
      reviewId: reviewId || null,
      userId: authUser.id,
      parentCommentId: null,
    };

    try {
      await createComment(commentDTO);
      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim() || !authUser || !authUser.id) {
      console.warn("Cannot reply: user not authenticated or missing ID");
      return;
    }

    const replyDTO = {
      text: replyText,
      novelId: novelId || null,
      chapterId: chapterId || null,
      reviewId: reviewId || null,
      userId: authUser.id,
      parentCommentId: commentId,
    };

    try {
      await createComment(replyDTO);
      await fetchComments();
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const CommentItem = ({ comment, level = 0 }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [menuPosition, setMenuPosition] = useState("top");

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          !e.target.closest(`#menu-${comment.id}`) &&
          !e.target.closest(`#menu-button-${comment.id}`)
        ) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [comment.id]);

    useEffect(() => {
      const button = document.getElementById(`menu-button-${comment.id}`);
      if (button) {
        const rect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.bottom + 100 > viewportHeight) {
          setMenuPosition("bottom");
        } else {
          setMenuPosition("top");
        }
      }
    }, [comment.id]);

    const handleReplySubmit = async (e) => {
      e.preventDefault();
      await handleReply(comment.id, replyText);
      setReplyText("");
      setShowReplyInput(false);
    };

    const handleEditSubmit = async (e) => {
      e.preventDefault();
      if (!editText.trim()) return;

      try {
        const updatedComment = { ...comment, text: editText };
        await updateComment(comment.id, updatedComment);
        await fetchComments();
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to edit comment:", error);
      }
    };

    return (
      <div
        className={`comment relative mb-4 bg-white rounded-lg`}
        style={{ paddingLeft: level > 0 ? `${level * 1.5}rem` : undefined }}
      >
        <div className="flex items-center gap-2">
          <img
            src={comment.userAvatarUrl ? comment.userAvatarUrl : "/images/user_avatar.png"}
            alt={comment.username}
            className="w-7 h-7 rounded-lg object-cover"
          />
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[14px] text-[#212529]">
                {comment.username}
              </span>
              <span className="text-[12px] text-[#8A8A8E]">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-[#8A8A8E] text-[12px] hover:text-blue-500">
                <span>↑</span>
                <span>{comment.likes || 0}</span>
              </button>
              <button className="text-[#8A8A8E] text-[12px] hover:text-blue-500">
                ↓
              </button>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 border rounded-lg p-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-1 rounded-lg text-[14px] hover:bg-blue-600"
            >
              ЗБЕРЕГТИ
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 px-4 py-1 rounded-lg text-[14px] hover:text-gray-700"
            >
              СКАСУВАТИ
            </button>
          </form>
        ) : (
          <p className="text-sm mt-2 text-[#212529] whitespace-pre-line">
            {comment.text}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-[12px] text-blue-500 relative">
          <button
            className="hover:text-blue-700 cursor-pointer"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            ВІДПОВІСТИ
          </button>
          {authUser?.id === comment.userId && (
            <div className="relative inline-block text-left">
              <button
                id={`menu-button-${comment.id}`}
                onClick={() => setMenuOpen(!menuOpen)}
                className="hover:text-blue-700 cursor-pointer"
              >
                •••
              </button>
              {menuOpen && (
                <div
                  id={`menu-${comment.id}`}
                  className={`absolute ${
                    menuPosition === "top" ? "top-full mt-2" : "bottom-full mb-2"
                  } left-0 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20
                    transition-all duration-200 ease-out transform
                    opacity-100 scale-100 translate-y-0
                    ${menuPosition === "top" ? "origin-top-left" : "origin-bottom-left"}`}
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ✏️
                    <span className="ml-2">Редагувати</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteComment(comment.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                  >
                    🗑️
                    <span className="ml-2">Видалити</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {showReplyInput && (
          <form onSubmit={handleReplySubmit} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Написать ответ..."
              className="flex-1 border rounded-lg p-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-1 rounded-lg text-[14px] hover:bg-blue-600"
            >
              ВІДПРАВИТИ
            </button>
          </form>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply, index) => (
              <CommentItem
                key={`${comment.id}-reply-${reply.id}-${index}`}
                comment={reply}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2 max-w-full">
      {loading ? (
        <p>Завантаження коментарів...</p>
      ) : (
        <>
          {authUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написати комментар..."
                className="flex-1 border rounded-lg p-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-1 rounded-lg text-[14px] hover:bg-blue-600"
              >
                ВІДПРАВИТИ
              </button>
            </form>
          ) : (
            <p className="mb-4 text-gray-500">Увійдіть, щоб залишити коментар</p>
          )}

          <div>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p>Коментарі відсутні</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Comments;