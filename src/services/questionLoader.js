// This automatically scans all JSON files inside src/data
const questionFiles = import.meta.glob('../data/**/*.json', { eager: true });

let allQuestions = [];
const subjectsMap = {};

// Go through every file found
Object.keys(questionFiles).forEach((path) => {
  const fileData = questionFiles[path].default || questionFiles[path];
  
  if (Array.isArray(fileData)) {
    fileData.forEach(q => {
      if (!q.subject || !q.chapter) return;

      // Create subject if it doesn't exist yet
      if (!subjectsMap[q.subject]) {
        subjectsMap[q.subject] = {
          name: q.subject,
          totalMcqs: 0,
          chapters: {}
        };
      }

      // Create chapter if it doesn't exist yet
      if (!subjectsMap[q.subject].chapters[q.chapter]) {
        subjectsMap[q.subject].chapters[q.chapter] = {
          name: q.chapter,
          totalMcqs: 0,
          questions: []
        };
      }

      // Add question and increase counts
      subjectsMap[q.subject].chapters[q.chapter].questions.push(q);
      subjectsMap[q.subject].chapters[q.chapter].totalMcqs++;
      subjectsMap[q.subject].totalMcqs++;
      allQuestions.push(q);
    });
  }
});

// Convert chapters object to an array for React to read easily
export const structuredData = Object.values(subjectsMap).map(subject => ({
  ...subject,
  chapters: Object.values(subject.chapters)
}));