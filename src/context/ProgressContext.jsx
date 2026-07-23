import { createContext, useContext, useEffect, useState } from 'react';

const ProgressContext = createContext();
export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(() => {
    // Load saved progress from browser local storage
    const saved = localStorage.getItem('ak_academy_progress');
    return saved ? JSON.parse(saved) : {
      used: [],
      correct: [],
      incorrect: [],
      favourites: []
    };
  });

  // Save to local storage every time progress changes
  useEffect(() => {
    localStorage.setItem('ak_academy_progress', JSON.stringify(progress));
  }, [progress]);

  // Record an answer when a user clicks an option
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

  // Toggle favourite (bookmark) button
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

  return (
    <ProgressContext.Provider value={{ progress, recordAnswer, toggleFavourite, isFavourite }}>
      {children}
    </ProgressContext.Provider>
  );
};