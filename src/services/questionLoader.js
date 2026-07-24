const questionFiles = import.meta.glob('../data/**/*.json', { eager: true });

let allQuestions = [];
const subjectsMap = {};

Object.keys(questionFiles).forEach((path) => {
  const fileData = questionFiles[path].default || questionFiles[path];
  if (!Array.isArray(fileData)) return;

  // --- THE BULLETPROOF FIX ---
  // Extract Subject and Chapter directly from the FOLDER NAMES, ignoring the JSON text.
  // Example path: '../data/biology/11th/Chapter 3 - Enzymes/part1.json'
  const parts = path.split('/');
  parts.pop(); // removes 'part1.json'
  const chapterName = parts.pop(); // gets 'Chapter 3 - Enzymes'
  
  // Find the subject name (the folder right after 'data')
  const dataIndex = parts.indexOf('data');
  const subjectName = parts[dataIndex + 1] || 'Unknown';
  const formattedSubject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);

  // Initialize subject if it doesn't exist
  if (!subjectsMap[formattedSubject]) {
    subjectsMap[formattedSubject] = { name: formattedSubject, totalMcqs: 0, chapters: {} };
  }

  // Initialize chapter if it doesn't exist
  if (!subjectsMap[formattedSubject].chapters[chapterName]) {
    subjectsMap[formattedSubject].chapters[chapterName] = { name: chapterName, totalMcqs: 0, questions: [] };
  }

  // Add questions and count them
  fileData.forEach(q => {
    // Force the subject and chapter to match the folder names
    q.subject = formattedSubject;
    q.chapter = chapterName;

    subjectsMap[formattedSubject].chapters[chapterName].questions.push(q);
    subjectsMap[formattedSubject].chapters[chapterName].totalMcqs++;
    subjectsMap[formattedSubject].totalMcqs++;
    allQuestions.push(q);
  });
});

// Convert chapters object to an array for React
export const structuredData = Object.values(subjectsMap).map(subject => ({
  ...subject,
  chapters: Object.values(subject.chapters)
}));