import { createContext, useContext, useEffect, useState } from 'react';
import { structuredData } from '../services/questionLoader';

const ProgressContext = createContext();
export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('ak_academy_progress');
    return saved ? JSON.parse(saved) : {
      used: [],
      correct: [],
      incorrect: [],
      favourites: []
    };
  });

  useEffect(() => {
    localStorage.setItem('ak_academy_progress', JSON.stringify(progress));
  }, [progress]);

  const recordAnswer = (questionId, isCorrect) => {
    setProgress(prev => {
      let newCorrect = [...prev.correct];
      let newIncorrect = [...prev.incorrect];
      let newUsed = [...prev.used];

      if (!newUsed.includes(questionId)) newUsed.push(questionId);

      if (isCorrect) {
        if (!newCorrect.includes(questionId)) newCorrect.push(questionId);
        newIncorrect = newIncorrect.filter(id => id !== questionId);
      } else {
        if (!newIncorrect.includes(questionId)) newIncorrect.push(questionId);
        newCorrect = newCorrect.filter(id => id !== questionId);
      }

      return { ...prev, used: newUsed, correct: newCorrect, incorrect: newIncorrect };
    });
  };

  const toggleFavourite = (questionId) => {
    setProgress(prev => {
      const isFav = prev.favourites.includes(questionId);
      return {
        ...prev,
        favourites: isFav ? prev.favourites.filter(id => id !== questionId) : [...prev.favourites, questionId]
      };
    });
  };

  const isFavourite = (questionId) => progress.favourites.includes(questionId);

  // NEW: Reset progress for a specific chapter
  const resetChapterProgress = (chapterName) => {
    const chapter = structuredData.flatMap(s => s.chapters).find(c => c.name === chapterName);
    if (!chapter) return;
    const idsToRemove = new Set(chapter.questions.map(q => q.id));

    setProgress(prev => ({
      used: prev.used.filter(id => !idsToRemove.has(id)),
      correct: prev.correct.filter(id => !idsToRemove.has(id)),
      incorrect: prev.incorrect.filter(id => !idsToRemove.has(id)),
      favourites: prev.favourites.filter(id => !idsToRemove.has(id))
    }));
  };

  // NEW: Reset progress for an entire subject
  const resetSubjectProgress = (subjectName) => {
    const subject = structuredData.find(s => s.name === subjectName);
    if (!subject) return;
    const idsToRemove = new Set(subject.chapters.flatMap(c => c.questions.map(q => q.id)));

    setProgress(prev => ({
      used: prev.used.filter(id => !idsToRemove.has(id)),
      correct: prev.correct.filter(id => !idsToRemove.has(id)),
      incorrect: prev.incorrect.filter(id => !idsToRemove.has(id)),
      favourites: prev.favourites.filter(id => !idsToRemove.has(id))
    }));
  };

  return (
    <ProgressContext.Provider value={{ progress, recordAnswer, toggleFavourite, isFavourite, resetChapterProgress, resetSubjectProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};