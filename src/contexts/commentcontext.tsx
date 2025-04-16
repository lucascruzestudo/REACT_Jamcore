import React, { createContext, useContext, useState, useCallback } from 'react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  displayName: string;
  userProfilePictureUrl: string;
  createdAt: string;
  userProfileUpdatedAt: string;
}

interface CommentContextData {
  getComments: (trackId: string) => Comment[];
  addComment: (trackId: string, comment: Comment) => void;
  removeComment: (trackId: string, commentId: string) => void;
  clearComments: (trackId: string) => void;
}

const CommentContext = createContext<CommentContextData>({} as CommentContextData);

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<{ [trackId: string]: Comment[] }>({});

  const getComments = useCallback((trackId: string): Comment[] => {
    return comments[trackId] || [];
  }, [comments]);

  const addComment = useCallback((trackId: string, comment: Comment) => {
    setComments((prev) => ({
      ...prev,
      [trackId]: [comment, ...(prev[trackId] || [])],
    }));
  }, []);

  const removeComment = useCallback((trackId: string, commentId: string) => {
    setComments((prev) => ({
      ...prev,
      [trackId]: (prev[trackId] || []).filter((comment) => comment.id !== commentId),
    }));
  }, []);

  const clearComments = useCallback((trackId: string) => {
    setComments((prev) => {
      const { [trackId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return (
    <CommentContext.Provider value={{ getComments, addComment, removeComment, clearComments }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider');
  }
  return context;
};