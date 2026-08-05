import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader.js';

const TestBuilder = () => {
  const { subjectName, chapterName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('');
  const [selectedOriginalChapters, setSelectedOriginalChapters] = useState([]);
  const [error, setError] = useState('');

  // ============================================
  // ROBUST PARAM MATCHING (5 fallback strategies)
  // ============================================
  const findSubject = (subjects, rawName) => {
    if (!rawName || !subjects) return null;
    const strategies = [
      (s) => s.name === rawName,
      (s) => s.name === decodeURIComponent(rawName),
      (s) => s.name.toLowerCase() === rawName.toLowerCase(),
      (s) => s.name.toLowerCase() === decodeURIComponent(rawName).toLowerCase(),
      (s) => encodeURIComponent(s.name) === rawName,
    ];
    for (const strategy of strategies) {
      const found = subjects.find(strategy);
      if (found) return found;
    }
    return null;
  };

  const findChapter = (chapters, rawName) => {
    if (!rawName || !chapters) return null;
    const strategies = [
      (c) => c.name === rawName,
      (c) => c.name === decodeURIComponent(rawName),
      (c) => c.name.toLowerCase() === rawName.toLowerCase(),
      (c) => c.name.toLowerCase() === decodeURIComponent(rawName).toLowerCase(),
      (c) => encodeURIComponent(c.name) === rawName,
    ];
    for (const strategy of strategies) {
      const found = chapters.find(strategy);
      if (found) return found;
    }
    return null;
  };

  const subject = useMemo(
    () => findSubject(structuredData, subjectName),
    [subjectName]
  );

  const chapter = useMemo(() => {
    if (!subject) return null;
    return findChapter(subject.chapters, chapterName);
  }, [subject, chapterName]);

  // ============================================
  // STRICT FILTER FUNCTION
  // Subject  -> q.category      (JSON's "subject" field)
  // Chapter  -> q.originalChapter (JSON's "chapter" field)
  // Difficulty-> q.difficulty     (JSON's "difficulty" field)
  // ============================================
  const getFilteredQuestions = (
    questions,
    clickedChapterName,
    subjectFilter,
    difficultyFilter,
    selectedOrigChapters
  ) => {
    if (!questions) return [];
    return questions.filter((q) => {
      // 1. CHAPTER FILTER
      //    If user picked a specific chapter from dropdown -> match that
      //    If user picked "All Chapters" -> show ALL (no chapter filter)
      let chapterMatch = true;
      if (selectedOrigChapters && selectedOrigChapters.length > 0) {
        chapterMatch = selectedOrigChapters.includes(q.originalChapter);
      }

      // 2. SUBJECT FILTER: strictly match JSON's "subject" field
      const subjectMatch = !subjectFilter || q.category === subjectFilter;

      // 3. DIFFICULTY FILTER: strictly match JSON's "difficulty" field
      const difficultyMatch =
        !difficultyFilter || q.difficulty === difficultyFilter;

      return chapterMatch && subjectMatch && difficultyMatch;
    });
  };

  // ============================================
  // DERIVED DATA
  // ============================================

  // Unique originalChapter values from the questions (for chapter filter dropdown)
  const originalChapterOptions = useMemo(() => {
    if (!chapter) return [];
    return [
      ...new Set(chapter.questions.map((q) => q.originalChapter)),
    ].sort();
  }, [chapter]);

  // Does this folder contain MCQs from multiple chapters?
  const hasMultipleChapters = useMemo(() => {
    return originalChapterOptions.length > 1;
  }, [originalChapterOptions]);

  // Unique subject/category values (for subject filter dropdown)
  const subjectCategoryOptions = useMemo(() => {
    if (!chapter) return [];
    return [
      ...new Set(
        chapter.questions
          .filter((q) => {
            if (selectedOriginalChapters.length > 0) {
              return selectedOriginalChapters.includes(q.originalChapter);
            }
            return true;
          })
          .map((q) => q.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [chapter, selectedOriginalChapters]);

  // Unique difficulty values (for difficulty filter dropdown)
  const difficultyOptions = useMemo(() => {
    if (!chapter) return [];
    return [
      ...new Set(
        chapter.questions
          .filter((q) => {
            const chapterOk =
              selectedOriginalChapters.length > 0
                ? selectedOriginalChapters.includes(q.originalChapter)
                : true;
            const subjectOk = !subjectCategory || q.category === subjectCategory;
            return chapterOk && subjectOk;
          })
          .map((q) => q.difficulty)
          .filter(Boolean)
      ),
    ].sort();
  }, [chapter, selectedOriginalChapters, subjectCategory]);

  // Get count for a specific originalChapter
  const getChapterCount = (originalChapterName) => {
    if (!chapter) return 0;
    return chapter.questions.filter((q) => {
      const subjectMatch = !subjectCategory || q.category === subjectCategory;
      const difficultyMatch = !difficulty || q.difficulty === difficulty;
      return (
        q.originalChapter === originalChapterName &&
        subjectMatch &&
        difficultyMatch
      );
    }).length;
  };

  // ============================================
  // FILTERED QUESTION COUNT (for display)
  // ============================================
  const filteredQuestions = useMemo(() => {
    if (!chapter) return [];
    return getFilteredQuestions(
      chapter.questions,
      chapter.name,
      subjectCategory,
      difficulty,
      selectedOriginalChapters
    );
  }, [chapter, subjectCategory, difficulty, selectedOriginalChapters]);

  const maxQuestions = filteredQuestions.length;

  // Reset numQuestions if it exceeds max
  useEffect(() => {
    if (numQuestions > maxQuestions && maxQuestions > 0) {
      setNumQuestions(maxQuestions);
    }
  }, [maxQuestions, numQuestions]);

  // ============================================
  // FILTER HANDLERS
  // ============================================
  const handleChapterFilterChange = (value) => {
    if (value === 'all') {
      setSelectedOriginalChapters([]);
    } else {
      setSelectedOriginalChapters([value]);
    }
  };

  const handleSubjectCategoryChange = (value) => {
    setSubjectCategory(value === 'all' ? '' : value);
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value === 'all' ? '' : value);
  };

  // ============================================
  // START TEST
  // ============================================
  const startTest = () => {
    if (filteredQuestions.length === 0) {
      setError(
        'No MCQs found matching the selected filters. Please adjust your filters.'
      );
      return;
    }

    if (numQuestions > filteredQuestions.length) {
      setError(
        `Only ${filteredQuestions.length} MCQs available. Please reduce the number or change filters.`
      );
      return;
    }

    // Shuffle for variety, but ALWAYS from the strictly filtered pool
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, numQuestions);

    setError('');

    navigate(
      `/test-engine/${encodeURIComponent(subject.name)}/${encodeURIComponent(chapter.name)}/${numQuestions}`,
      {
        state: {
          questions: selectedQuestions,
          subjectName: subject.name,
          chapterName: chapter.name,
          selectedOriginalChapters: selectedOriginalChapters,
          subjectCategory: subjectCategory,
          difficulty: difficulty,
        },
      }
    );
  };

  // ============================================
  // ERROR / LOADING STATES
  // ============================================
  if (!subject) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Subject not found</h2>
        <p>
          Could not find subject: <strong>{decodeURIComponent(subjectName)}</strong>
        </p>
        <Link to="/">Go Back Home</Link>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Chapter not found</h2>
        <p>
          Could not find chapter: <strong>{decodeURIComponent(chapterName)}</strong>{' '}
          in subject: <strong>{subject.name}</strong>
        </p>
        <Link to={`/test-builder/${encodeURIComponent(subject.name)}`}>
          Back to {subject.name}
        </Link>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Back Link */}
      <Link
        to={`/test-builder/${encodeURIComponent(subject.name)}`}
        style={{
          display: 'inline-block',
          marginBottom: '1rem',
          color: '#6366f1',
          textDecoration: 'none',
        }}
      >
        &larr; Back to {subject.name}
      </Link>

      {/* Header */}
      <h2 style={{ marginBottom: '0.5rem' }}>{chapter.name}</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Subject: {subject.name} &bull; Total MCQs in folder:{' '}
        {chapter.questions.length}
      </p>

      {/* ============================================ */}
      {/* FILTER: Chapter (originalChapter from JSON) */}
      {/* ============================================ */}
      {hasMultipleChapters && (
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.4rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Filter by Chapter
          </label>
          <select
            value={
              selectedOriginalChapters.length === 1
                ? selectedOriginalChapters[0]
                : 'all'
            }
            onChange={(e) => handleChapterFilterChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.95rem',
            }}
          >
            <option value="all">
              All Chapters ({maxQuestions} MCQs)
            </option>
            {originalChapterOptions.map((ch) => (
              <option key={ch} value={ch}>
                {ch} ({getChapterCount(ch)} MCQs)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTER: Subject (category from JSON)       */}
      {/* ============================================ */}
      {subjectCategoryOptions.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.4rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Filter by Subject
          </label>
          <select
            value={subjectCategory || 'all'}
            onChange={(e) => handleSubjectCategoryChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.95rem',
            }}
          >
            <option value="all">All Subjects</option>
            {subjectCategoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTER: Difficulty (from JSON)              */}
      {/* ============================================ */}
      {difficultyOptions.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.4rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Filter by Difficulty
          </label>
          <select
            value={difficulty || 'all'}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.95rem',
            }}
          >
            <option value="all">All Difficulties</option>
            {difficultyOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ============================================ */}
      {/* NUMBER OF QUESTIONS                         */}
      {/* ============================================ */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.4rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          Number of Questions (max: {maxQuestions})
        </label>
        <input
          type="number"
          min={1}
          max={maxQuestions}
          value={numQuestions}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            setNumQuestions(Math.min(Math.max(1, val), maxQuestions));
          }}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
          }}
        />
      </div>

      {/* Available MCQs info */}
      <div
        style={{
          padding: '0.8rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#1e40af',
        }}
      >
        <strong>{maxQuestions}</strong> MCQs available after filtering
        {selectedOriginalChapters.length > 0 && (
          <span>
            {' '}(Chapter: {selectedOriginalChapters.join(', ')})
          </span>
        )}
        {subjectCategory && <span> (Subject: {subjectCategory})</span>}
        {difficulty && <span> (Difficulty: {difficulty})</span>}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '0.8rem',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: '#dc2626',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Start Test Button */}
      <button
        onClick={startTest}
        disabled={maxQuestions === 0}
        style={{
          width: '100%',
          padding: '0.8rem',
          backgroundColor: maxQuestions > 0 ? '#6366f1' : '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: maxQuestions > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Start Test ({numQuestions} Questions)
      </button>
    </div>
  );
};

export default TestBuilder;
