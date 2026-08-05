import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

const TestEngine = () => {
  const { subjectName, chapterName, numQuestions: numQuestionsParam } = useParams();
  const location = useLocation();

  const {
    questions: passedQuestions,
    subjectName: stateSubjectName,
    chapterName: stateChapterName,
    selectedOriginalChapters,
    subjectCategory,
    difficulty,
  } = location.state || {};

  // ============================================
  // STRICT SAFETY FILTER
  // Even though TestBuilder already filters,
  // we filter again here as a safety net.
  // Subject  -> q.category        (JSON "subject" field)
  // Chapter  -> q.originalChapter  (JSON "chapter" field)
  // Difficulty-> q.difficulty       (JSON "difficulty" field)
  // ============================================
  const filteredQuestions = useMemo(() => {
    if (!passedQuestions || passedQuestions.length === 0) return [];

    // TestBuilder already filtered before passing, so just use them directly.
    // This safety filter only re-checks if user had selected specific filters.
    return passedQuestions.filter((q) => {
      // 1. CHAPTER: only filter if user picked a specific chapter
      let chapterMatch = true;
      if (selectedOriginalChapters && selectedOriginalChapters.length > 0) {
        chapterMatch = selectedOriginalChapters.includes(q.originalChapter);
      }

      // 2. SUBJECT: only filter if user picked a specific subject
      const subjectMatch = !subjectCategory || q.category === subjectCategory;

      // 3. DIFFICULTY: only filter if user picked a specific difficulty
      const difficultyMatch = !difficulty || q.difficulty === difficulty;

      return chapterMatch && subjectMatch && difficultyMatch;
    });
  }, [passedQuestions, selectedOriginalChapters, subjectCategory, difficulty]);

  // ============================================
  // TEST STATE
  // ============================================
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // seconds, null = no timer

  const questions = filteredQuestions;
  const totalQuestions = questions.length;

  // ============================================
  // TIMER (optional - 60 seconds per question)
  // ============================================
  useEffect(() => {
    if (showResults || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-move to next or finish
          if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((i) => i + 1);
            return 60;
          } else {
            setShowResults(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, showResults, totalQuestions, timeLeft]);

  // Reset timer when moving to next question
  useEffect(() => {
    if (!showResults) {
      setTimeLeft(60);
    }
  }, [currentIndex, showResults]);

  // ============================================
  // HANDLE ANSWER SELECTION
  // ============================================
  const handleAnswerSelect = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowResults(true);
    }
  }, [currentIndex, totalQuestions]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const goToQuestion = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // ============================================
  // CALCULATE RESULTS
  // ============================================
  const results = useMemo(() => {
    if (!showResults) return null;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const details = [];

    questions.forEach((q, index) => {
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      const isUnanswered = !userAnswer;

      if (isUnanswered) unanswered++;
      else if (isCorrect) correct++;
      else wrong++;

      details.push({
        question: q,
        userAnswer,
        isCorrect,
        isUnanswered,
      });
    });

    return {
      total: totalQuestions,
      correct,
      wrong,
      unanswered,
      percentage: totalQuestions > 0 ? ((correct / totalQuestions) * 100).toFixed(1) : 0,
      details,
    };
  }, [showResults, questions, selectedAnswers, totalQuestions]);

  // ============================================
  // ERROR: NO QUESTIONS
  // ============================================
  if (questions.length === 0 && !showResults) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No Questions Available</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          No MCQs found matching the selected filters for this chapter.
        </p>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          {selectedOriginalChapters?.length > 0 && (
            <span>Chapter filter: {selectedOriginalChapters.join(', ')}<br /></span>
          )}
          {subjectCategory && <span>Subject filter: {subjectCategory}<br /></span>}
          {difficulty && <span>Difficulty filter: {difficulty}<br /></span>}
        </p>
        <Link
          to={`/test-builder/${encodeURIComponent(stateSubjectName || subjectName)}/${encodeURIComponent(stateChapterName || chapterName)}`}
          style={{ color: '#6366f1', textDecoration: 'none' }}
        >
          &larr; Back to Test Builder
        </Link>
      </div>
    );
  }

  // ============================================
  // RESULTS SCREEN
  // ============================================
  if (showResults && results) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Test Results</h2>

        {/* Score Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.8rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a' }}>
              {results.correct}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Correct</div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>
              {results.wrong}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Wrong</div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6b7280' }}>
              {results.unanswered}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Unanswered</div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb' }}>
              {results.percentage}%
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Score</div>
          </div>
        </div>

        {/* Question Review */}
        <h3 style={{ marginBottom: '0.8rem' }}>Question Review</h3>
        {results.details.map((detail, index) => {
          const q = detail.question;
          const optionLabels = {
            A: q.optionA,
            B: q.optionB,
            C: q.optionC,
            D: q.optionD,
          };

          return (
            <div
              key={index}
              style={{
                padding: '1rem',
                marginBottom: '0.8rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: detail.isCorrect
                  ? '#f0fdf4'
                  : detail.isUnanswered
                  ? '#f8fafc'
                  : '#fef2f2',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                Q{index + 1}. {q.question}
              </div>

              {/* Chapter & Difficulty info */}
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Chapter: {q.originalChapter || 'N/A'} | Subject: {q.category || 'N/A'} | Difficulty: {q.difficulty || 'N/A'}
              </div>

              {/* Options */}
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: '0.4rem 0.6rem',
                    marginBottom: '0.3rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    backgroundColor:
                      opt === q.correctAnswer
                        ? '#dcfce7'
                        : opt === detail.userAnswer && opt !== q.correctAnswer
                        ? '#fee2e2'
                        : 'transparent',
                    border:
                      opt === q.correctAnswer
                        ? '1px solid #22c55e'
                        : opt === detail.userAnswer && opt !== q.correctAnswer
                        ? '1px solid #ef4444'
                        : '1px solid #e5e7eb',
                  }}
                >
                  <strong>{opt}.</strong> {optionLabels[opt]}
                  {opt === q.correctAnswer && ' ✓'}
                  {opt === detail.userAnswer && opt !== q.correctAnswer && ' ✗'}
                </div>
              ))}

              {/* Explanation */}
              {q.explanation && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#4b5563',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                  }}
                >
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}

        {/* Back Button */}
        <Link
          to={`/test-builder/${encodeURIComponent(stateSubjectName || subjectName)}/${encodeURIComponent(stateChapterName || chapterName)}`}
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            padding: '0.7rem 1.5rem',
            backgroundColor: '#6366f1',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Back to Test Builder
        </Link>
      </div>
    );
  }

  // ============================================
  // QUESTION SCREEN
  // ============================================
  const currentQuestion = questions[currentIndex];
  const currentAnswer = selectedAnswers[currentIndex];
  const optionMap = {
    A: currentQuestion?.optionA,
    B: currentQuestion?.optionB,
    C: currentQuestion?.optionC,
    D: currentQuestion?.optionD,
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>{stateChapterName || decodeURIComponent(chapterName)}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
            {stateSubjectName || decodeURIComponent(subjectName)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {timeLeft !== null && (
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: timeLeft <= 10 ? '#dc2626' : '#16a34a',
              }}
            >
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          )}
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            height: '100%',
            backgroundColor: '#6366f1',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Question */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Q{currentIndex + 1}. {currentQuestion.question}
        </div>

        {/* MCQ info tags */}
        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          {currentQuestion.originalChapter && (
            <span style={{ marginRight: '0.8rem' }}>
              Chapter: {currentQuestion.originalChapter}
            </span>
          )}
          {currentQuestion.category && (
            <span style={{ marginRight: '0.8rem' }}>
              Subject: {currentQuestion.category}
            </span>
          )}
          {currentQuestion.difficulty && (
            <span>Difficulty: {currentQuestion.difficulty}</span>
          )}
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: '1.5rem' }}>
        {['A', 'B', 'C', 'D'].map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswerSelect(currentIndex, opt)}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.8rem 1rem',
              marginBottom: '0.5rem',
              border:
                currentAnswer === opt
                  ? '2px solid #6366f1'
                  : '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: currentAnswer === opt ? '#eef2ff' : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
            }}
          >
            <strong style={{ marginRight: '0.5rem', color: '#6366f1' }}>{opt}.</strong>
            {optionMap[opt]}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.8rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          style={{
            flex: 1,
            padding: '0.7rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: currentIndex === 0 ? '#f3f4f6' : 'white',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          &larr; Previous
        </button>

        <button
          onClick={goToNext}
          style={{
            flex: 1,
            padding: '0.7rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#6366f1',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {currentIndex === totalQuestions - 1 ? 'Finish Test' : 'Next &rarr;'}
        </button>
      </div>

      {/* Question Palette */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Question Navigator
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}
        >
          {questions.map((_, index) => {
            const isAnswered = selectedAnswers[index] !== undefined;
            const isCurrent = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  border: isCurrent
                    ? '2px solid #6366f1'
                    : '1px solid #d1d5db',
                  backgroundColor: isAnswered
                    ? '#6366f1'
                    : isCurrent
                    ? '#eef2ff'
                    : 'white',
                  color: isAnswered ? 'white' : '#374151',
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestEngine;
